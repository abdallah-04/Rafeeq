from __future__ import annotations

import json
import random
import sys
import time
from pathlib import Path

import torch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from rafeeq_qg.v04_formats import content_match, parse_sentinel

DATA = ROOT / "data" / "v04_actual" / "rafeeq_v04_sanity_actual.jsonl"
RUNTIME = Path(r"D:\RafeeqML")
MODEL_PATH = RUNTIME / "models" / "rafeeq-v04-sanity-sentinel-adafactor"
MAX_STEPS = 2000
INTERVAL = 200


def read_rows() -> list[dict]:
    rows = [json.loads(line) for line in DATA.read_text(encoding="utf-8").splitlines() if line.strip()]
    if len(rows) != 12 or len({row["input_condition"] for row in rows}) != 12:
        raise RuntimeError("v0.4 sanity file must contain 12 unique conditions")
    if any(row["historical_split"] != "train" for row in rows):
        raise RuntimeError("v0.4 sanity rows must be historical TRAIN rows")
    return rows


def decode(tokenizer, ids: list[int]) -> str:
    excluded = {tokenizer.pad_token_id, tokenizer.eos_token_id}
    return tokenizer.decode([value for value in ids if value not in excluded], skip_special_tokens=False, clean_up_tokenization_spaces=False).strip()


@torch.no_grad()
def evaluate(model, tokenizer, rows: list[dict]) -> list[dict]:
    model.eval()
    results = []
    for row in rows:
        encoded = tokenizer(row["input_condition"], return_tensors="pt", truncation=True, max_length=128)
        encoded = {key: value.to(model.device) for key, value in encoded.items()}
        ids = model.generate(**encoded, do_sample=False, max_new_tokens=160)[0].cpu().tolist()
        raw = decode(tokenizer, ids)
        parsed = None
        error = None
        try:
            parsed = parse_sentinel(raw)
        except ValueError as exc:
            error = str(exc)
        matches = content_match(parsed, row["training_expected"])
        results.append({"id": row["id"], "expected_target": row["targets"]["sentinel_native_v2"], "raw_token_ids": ids, "raw_output": raw, "parsed": parsed, "strict_parse": parsed is not None, "content_match_fields": matches, "content_match_out_of": 7, "failure_reason": error})
    return results


@torch.no_grad()
def teacher_forced(model, encoded_rows, labels) -> dict:
    correct = total = 0
    first = []
    for encoded, target in zip(encoded_rows, labels):
        batch = {key: value.to(model.device) for key, value in encoded.items()}
        label = target.to(model.device).unsqueeze(0)
        logits = model(**batch, decoder_input_ids=model._shift_right(label)).logits[0]
        valid = label[0] != -100
        correct += int((logits.argmax(-1)[valid] == label[0][valid]).sum())
        total += int(valid.sum())
        ranks = (logits[0].argsort(descending=True) == label[0, 0]).nonzero(as_tuple=False)
        first.append({"expected_token_id": int(label[0, 0]), "rank": int(ranks[0].item()) + 1 if len(ranks) else None, "logit": float(logits[0, int(label[0, 0])])})
    return {"token_accuracy": correct / total if total else 0.0, "correct_tokens": correct, "total_tokens": total, "first_target": first}


def main() -> None:
    from transformers import Adafactor, AutoModelForSeq2SeqLM, AutoTokenizer

    if MODEL_PATH.exists():
        raise RuntimeError(f"refusing to overwrite {MODEL_PATH}")
    rows = read_rows()
    random.seed(42)
    torch.manual_seed(42)
    tokenizer = AutoTokenizer.from_pretrained("google/mt5-small", use_fast=False)
    model = AutoModelForSeq2SeqLM.from_pretrained("google/mt5-small").to("cuda")
    if len(tokenizer) > model.get_input_embeddings().num_embeddings:
        raise RuntimeError("native model embedding matrix is too small")
    targets = [row["targets"]["sentinel_native_v2"] for row in rows]
    encoded_rows = [tokenizer(row["input_condition"], return_tensors="pt", truncation=True, max_length=128) for row in rows]
    labels = [tokenizer(target, return_tensors="pt", truncation=True, max_length=192)["input_ids"][0] for target in targets]
    optimizer = Adafactor(model.parameters(), lr=1e-3, relative_step=False, scale_parameter=False, warmup_init=False, clip_threshold=1.0, weight_decay=0.0)
    model.config.use_cache = False
    losses = []
    checkpoints = []
    started = time.perf_counter()
    for step in range(1, MAX_STEPS + 1):
        index = (step - 1) % len(rows)
        model.train()
        batch = {key: value.to("cuda") for key, value in encoded_rows[index].items()}
        loss = model(**batch, labels=labels[index].to("cuda").unsqueeze(0)).loss
        if not torch.isfinite(loss):
            raise RuntimeError(f"non-finite loss at step {step}")
        loss.backward()
        optimizer.step()
        optimizer.zero_grad(set_to_none=True)
        losses.append(float(loss.item()))
        if step % INTERVAL == 0:
            generated = evaluate(model, tokenizer, rows)
            teacher = teacher_forced(model, encoded_rows, labels)
            checkpoints.append({"step": step, "loss": sum(losses[-INTERVAL:]) / INTERVAL, "teacher_forced": teacher, "strict_parse": sum(item["strict_parse"] for item in generated), "exact_content": sum(item["content_match_fields"] == 7 for item in generated)})
            print(f"step={step} loss={checkpoints[-1]['loss']:.5f} token_acc={teacher['token_accuracy']:.4f} parse={checkpoints[-1]['strict_parse']}/12 content={checkpoints[-1]['exact_content']}/12", flush=True)
            if checkpoints[-1]["exact_content"] >= 10:
                break
    model.config.use_cache = True
    final = evaluate(model, tokenizer, rows)
    final_teacher = teacher_forced(model, encoded_rows, labels)
    MODEL_PATH.mkdir(parents=True)
    model.save_pretrained(MODEL_PATH)
    tokenizer.save_pretrained(MODEL_PATH)
    report = {"base_model": "google/mt5-small", "serialization": "sentinel_native_v2", "optimizer": "Adafactor", "learning_rate": 1e-3, "steps": step, "precision": "FP32", "device": torch.cuda.get_device_name(0), "rows": 12, "tokenizer_length": len(tokenizer), "model_embedding_size": model.get_input_embeddings().num_embeddings, "teacher_forced_final": final_teacher, "loss_progression": checkpoints, "strict_parse_count": sum(item["strict_parse"] for item in final), "exact_content_count": sum(item["content_match_fields"] == 7 for item in final), "outputs": final, "runtime_seconds": time.perf_counter() - started, "pass_gate": sum(item["strict_parse"] and item["content_match_fields"] == 7 for item in final) >= 10, "master_training_run": False}
    output = RUNTIME / "outputs" / "v04_sanity_results.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: report[key] for key in ("steps", "strict_parse_count", "exact_content_count", "runtime_seconds", "pass_gate")}, indent=2))


if __name__ == "__main__":
    main()
