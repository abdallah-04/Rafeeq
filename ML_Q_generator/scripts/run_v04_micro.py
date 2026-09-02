from __future__ import annotations

import json
import random
import sys
import time
from pathlib import Path

import torch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from rafeeq_qg.v04_formats import content_match, parse_plain, parse_sentinel, serialize_plain, serialize_sentinel
from rafeeq_qg.runtime_paths import resolve_runtime_paths

DATA = ROOT / "data" / "v04_actual" / "rafeeq_v04_micro_actual.jsonl"
RUNTIME_PATHS = resolve_runtime_paths(ROOT)
RUNTIME = RUNTIME_PATHS.models_dir.parent
MAX_STEPS = 2000
INTERVAL = 200


def read_rows() -> list[dict]:
    rows = [json.loads(line) for line in DATA.read_text(encoding="utf-8").splitlines() if line.strip()]
    if len(rows) != 2 or len({row["input_condition"] for row in rows}) != 2:
        raise RuntimeError("v0.4 micro file must contain exactly two unique conditions")
    if any(row["historical_split"] != "train" for row in rows):
        raise RuntimeError("micro rows must be historical TRAIN rows")
    return rows


def decode(tokenizer, ids: list[int]) -> str:
    excluded = {tokenizer.pad_token_id, tokenizer.eos_token_id}
    return tokenizer.decode([value for value in ids if value not in excluded], skip_special_tokens=False, clean_up_tokenization_spaces=False).strip()


@torch.no_grad()
def evaluate(model, tokenizer, rows, serialization: str) -> tuple[list[dict], float]:
    model.eval()
    parser = parse_sentinel if serialization == "sentinel" else parse_plain
    results = []
    for row in rows:
        encoded = tokenizer(row["input_condition"], return_tensors="pt", truncation=True, max_length=128)
        encoded = {key: value.to(model.device) for key, value in encoded.items()}
        ids = model.generate(**encoded, do_sample=False, max_new_tokens=128)[0].cpu().tolist()
        raw = decode(tokenizer, ids)
        parsed = None
        error = None
        try:
            parsed = parser(raw)
        except ValueError as exc:
            error = str(exc)
        match = content_match(parsed, row["training_expected"])
        results.append({"id": row["id"], "input": row["input_condition"], "expected_target": row["targets"]["sentinel_native_v2" if serialization == "sentinel" else "plain_text"], "raw_token_ids": ids, "raw_output": raw, "parsed": parsed, "strict_parse": parsed is not None, "content_match_fields": match, "content_match_out_of": 7, "failure_reason": error})
    return results, sum(item["strict_parse"] and item["content_match_fields"] == 7 for item in results) / 2


@torch.no_grad()
def teacher_forced_metrics(model, tokenizer, encoded_rows, labels) -> dict:
    correct = total = 0
    first = []
    for encoded, target in zip(encoded_rows, labels):
        batch = {key: value.to(model.device) for key, value in encoded.items()}
        label = target.to(model.device).unsqueeze(0)
        decoder_input_ids = model._shift_right(label)
        logits = model(**batch, decoder_input_ids=decoder_input_ids).logits[0]
        valid = label[0] != -100
        correct += int((logits.argmax(-1)[valid] == label[0][valid]).sum())
        total += int(valid.sum())
        ranks = (logits[0].argsort(descending=True) == label[0, 0]).nonzero(as_tuple=False)
        first.append({"expected_token_id": int(label[0, 0]), "rank": int(ranks[0].item()) + 1 if len(ranks) else None, "logit": float(logits[0, int(label[0, 0])])})
    return {"token_accuracy": correct / total if total else 0.0, "correct_tokens": correct, "total_tokens": total, "first_target": first}


def run_one(rows: list[dict], serialization: str, optimizer_name: str, lr: float) -> dict:
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, Adafactor

    name = f"rafeeq-v04-micro-{serialization}-{optimizer_name.lower()}"
    model_path = RUNTIME_PATHS.models_dir / name
    if model_path.exists():
        raise RuntimeError(f"refusing to overwrite {model_path}")
    checkpoint_path = RUNTIME_PATHS.checkpoints_dir / name
    started = time.perf_counter()
    tokenizer = AutoTokenizer.from_pretrained("google/mt5-small", use_fast=False)
    model = AutoModelForSeq2SeqLM.from_pretrained("google/mt5-small").to("cuda")
    embedding_size = model.get_input_embeddings().num_embeddings
    if len(tokenizer) > embedding_size:
        raise RuntimeError("v0.4 tokenizer is larger than the native model embedding matrix")
    targets = [serialize_sentinel(row) if serialization == "sentinel" else serialize_plain(row) for row in rows]
    encoded_rows = [tokenizer(row["input_condition"], return_tensors="pt", truncation=True, max_length=128) for row in rows]
    labels = [tokenizer(text, return_tensors="pt", truncation=True, max_length=160)["input_ids"][0] for text in targets]
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=0.0) if optimizer_name == "AdamW" else Adafactor(model.parameters(), lr=lr, relative_step=False, scale_parameter=False, warmup_init=False, clip_threshold=1.0, weight_decay=0.0)
    random.seed(42)
    torch.manual_seed(42)
    losses = []
    checkpoints = []
    best = 0.0
    model.config.use_cache = False
    for step in range(1, MAX_STEPS + 1):
        index = (step - 1) % 2
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
            generated, content_rate = evaluate(model, tokenizer, rows, serialization)
            teacher = teacher_forced_metrics(model, tokenizer, encoded_rows, labels)
            best = max(best, content_rate)
            checkpoints.append({"step": step, "loss": sum(losses[-INTERVAL:]) / INTERVAL, "teacher_forced": teacher, "generated_strict_parse": sum(item["strict_parse"] for item in generated), "generated_content_pass": sum(item["content_match_fields"] == 7 for item in generated)})
            print(f"{name} step={step} loss={checkpoints[-1]['loss']:.5f} token_acc={teacher['token_accuracy']:.4f} content={sum(item['content_match_fields'] == 7 for item in generated)}/2", flush=True)
            if content_rate == 1.0:
                break
    model.config.use_cache = True
    final_outputs, _ = evaluate(model, tokenizer, rows, serialization)
    final_teacher = teacher_forced_metrics(model, tokenizer, encoded_rows, labels)
    model_path.mkdir(parents=True)
    checkpoint_path.mkdir(parents=True)
    model.save_pretrained(model_path)
    tokenizer.save_pretrained(model_path)
    result = {"run_name": name, "serialization": serialization, "optimizer": optimizer_name, "learning_rate": lr, "steps": step, "final_loss": losses[-1], "mean_final_interval_loss": sum(losses[-min(INTERVAL, len(losses)):]) / min(INTERVAL, len(losses)), "teacher_forced_final": final_teacher, "strict_parse_rate": f"{sum(item['strict_parse'] for item in final_outputs)}/2", "content_pass_rate": f"{sum(item['content_match_fields'] == 7 for item in final_outputs)}/2", "outputs": final_outputs, "checkpoints": checkpoints, "runtime_seconds": time.perf_counter() - started, "tokenizer_length": len(tokenizer), "model_embedding_size": embedding_size, "custom_tokens_registered": False, "embedding_resized": False}
    return result


def main() -> None:
    rows = read_rows()
    configs = [("sentinel", "AdamW", 5e-4), ("sentinel", "Adafactor", 1e-3), ("plain", "AdamW", 5e-4), ("plain", "Adafactor", 1e-3)]
    results = []
    for serialization, optimizer, lr in configs:
        result = run_one(rows, serialization, optimizer, lr)
        results.append(result)
        write_path = RUNTIME_PATHS.outputs_dir / f"{result['run_name']}.json"
        write_path.parent.mkdir(parents=True, exist_ok=True)
        write_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    comparison = [{key: result[key] for key in ("run_name", "serialization", "optimizer", "learning_rate", "steps", "final_loss", "strict_parse_rate", "content_pass_rate", "runtime_seconds")} for result in results]
    (RUNTIME_PATHS.outputs_dir / "v04_micro_comparison.json").write_text(json.dumps(comparison, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(comparison, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
