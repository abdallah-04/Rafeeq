from __future__ import annotations

import json
import random
import sys
from pathlib import Path

import torch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from rafeeq_qg.compact_format import parse_compact_target
from rafeeq_qg.model import load_seq2seq_model
from rafeeq_qg.tokenizer_utils import (
    decode_preserving_structural_tokens,
    sentinel_bad_words_ids,
    structural_token_ids,
)
from rafeeq_qg.config import PrototypeConfig


DATA_PATH = ROOT / "data" / "rafeeq-mt5-qg-v0.3-sanity" / "train.jsonl"
RUNTIME_ROOT = Path(r"D:\RafeeqML")
MODEL_PATH = RUNTIME_ROOT / "models" / "rafeeq-mt5-qg-v0.3-sanity"
OUTPUT_PATHS = {
    "normal": RUNTIME_ROOT / "outputs" / "v03_sanity_normal.json",
    "no_sentinels": RUNTIME_ROOT / "outputs" / "v03_sanity_no_sentinels.json",
    "structural_start": RUNTIME_ROOT / "outputs" / "v03_sanity_structural_start.json",
    "diagnostics": RUNTIME_ROOT / "outputs" / "v03_sanity_diagnostics.json",
}


def read_rows() -> list[dict]:
    rows = [json.loads(line) for line in DATA_PATH.read_text(encoding="utf-8").splitlines() if line.strip()]
    if len(rows) != 12 or len({row["input"]["condition"] for row in rows}) != 12:
        raise RuntimeError("sanity dataset must contain exactly 12 unique rows")
    return rows


def label_audit(rows: list[dict], tokenizer: object) -> dict:
    sentinel_ids = [
        tokenizer.encode(f"<extra_id_{index}>", add_special_tokens=False)[0]
        for index in range(100)
    ]
    entries = []
    found: list[dict] = []
    for row in rows:
        encoded = tokenizer(row["target"], add_special_tokens=True)["input_ids"]
        ids = encoded[0] if encoded and isinstance(encoded[0], list) else encoded
        hits = [token_id for token_id in ids if token_id in sentinel_ids]
        if hits:
            found.append({"id": row["id"], "sentinel_ids": hits})
        entries.append({
            "id": row["id"],
            "has_structural_tags": all(tag in row["target"] for tag in [
                "<QUESTION>", "<OPTION_A>", "<OPTION_B>", "<OPTION_C>",
                "<OPTION_D>", "<CORRECT>", "<EXPLANATION>",
            ]),
            "eos_token_id": tokenizer.eos_token_id,
            "encoded_length": len(ids),
        })
    if found:
        raise RuntimeError(f"sentinel IDs found in labels: {found}")
    return {
        "sentinel_ids_checked": sentinel_ids,
        "sentinel_ids_found_in_labels": found,
        "count": 0,
        "examples": entries,
    }


def parse_result(raw: str) -> tuple[bool, dict | None, str | None]:
    try:
        parsed = parse_compact_target(raw)
        return True, {
            "question": parsed.question,
            "options": list(parsed.options),
            "correct_option": parsed.correct_option,
            "explanation": parsed.explanation,
        }, None
    except ValueError as exc:
        return False, None, str(exc)


@torch.no_grad()
def generate_rows(model, tokenizer, rows: list[dict], *, bad_words_ids=None, structural_start=False) -> list[dict]:
    model.eval()
    results = []
    question_id = tokenizer.convert_tokens_to_ids("<QUESTION>")
    start_id = model.config.decoder_start_token_id
    for row in rows:
        inputs = tokenizer(row["input"]["condition"], return_tensors="pt", truncation=True, max_length=96)
        inputs = {key: value.to(model.device) for key, value in inputs.items()}
        kwargs = {
            "do_sample": False,
            "max_new_tokens": 160,
            "bad_words_ids": bad_words_ids,
        }
        if structural_start:
            kwargs["decoder_input_ids"] = torch.tensor([[start_id, question_id]], device=model.device)
        output_ids = model.generate(**inputs, **kwargs)[0].detach().cpu().tolist()
        raw = decode_preserving_structural_tokens(tokenizer, output_ids)
        valid, parsed, error = parse_result(raw)
        results.append({
            "id": row["id"],
            "input": row["input"]["condition"],
            "expected_target": row["target"],
            "raw_generated_token_ids": output_ids,
            "raw_decoded_output": raw,
            "parsed_output": parsed,
            "valid": valid,
            "failure_reason": error,
        })
    return results


@torch.no_grad()
def first_step_diagnostic(model, tokenizer, row: dict) -> dict:
    inputs = tokenizer(row["input"]["condition"], return_tensors="pt", truncation=True, max_length=96)
    inputs = {key: value.to(model.device) for key, value in inputs.items()}
    decoder_input_ids = torch.tensor([[model.config.decoder_start_token_id]], device=model.device)
    logits = model(**inputs, decoder_input_ids=decoder_input_ids).logits[0, -1]
    values, ids = torch.topk(logits, 15)
    entries = []
    for rank, (token_id, logit) in enumerate(zip(ids.tolist(), values.tolist()), 1):
        entries.append({"rank": rank, "token": tokenizer.convert_ids_to_tokens(token_id), "token_id": token_id, "logit": logit})
    lookup = {}
    for token in ("<QUESTION>", "<extra_id_0>"):
        token_id = (
            tokenizer.convert_tokens_to_ids(token)
            if token == "<QUESTION>"
            else tokenizer.encode(token, add_special_tokens=False)[0]
        )
        positions = (logits.argsort(descending=True) == token_id).nonzero(as_tuple=False)
        lookup[token] = {
            "token_id": token_id,
            "rank": int(positions[0].item()) + 1 if len(positions) else None,
            "logit": float(logits[token_id].item()),
        }
    return {"example_id": row["id"], "top_15": entries, "requested_tokens": lookup}


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    if MODEL_PATH.exists():
        raise RuntimeError(f"refusing to overwrite existing model directory: {MODEL_PATH}")
    random.seed(42)
    torch.manual_seed(42)
    torch.set_float32_matmul_precision("high")
    if not torch.cuda.is_available():
        raise RuntimeError("RTX/CUDA is required for the sanity experiment")
    device = torch.device("cuda")
    rows = read_rows()
    config = PrototypeConfig(model_name="google/mt5-small", model_output_name=MODEL_PATH.name,
                             max_input_length=96, max_target_length=160, fp16=False)
    tokenizer, model = load_seq2seq_model(config.model_name, config)
    model.to(device)
    model.config.use_cache = False
    tokenizer_size = len(tokenizer)
    embedding_size = model.get_input_embeddings().num_embeddings
    if tokenizer_size != embedding_size:
        raise RuntimeError(f"tokenizer/model size mismatch: {tokenizer_size} != {embedding_size}")

    labels = []
    inputs = []
    for row in rows:
        inputs.append(tokenizer(row["input"]["condition"], return_tensors="pt", truncation=True, max_length=96))
        labels.append(tokenizer(row["target"], return_tensors="pt", truncation=True, max_length=160)["input_ids"][0])
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)
    loss_progression = []
    best_count = -1
    best_epoch = 0
    for epoch in range(1, 51):
        model.train()
        order = list(range(len(rows)))
        random.shuffle(order)
        losses = []
        for index in order:
            batch_inputs = {key: value.to(device) for key, value in inputs[index].items()}
            batch_labels = labels[index].to(device).unsqueeze(0)
            loss = model(**batch_inputs, labels=batch_labels).loss
            if not torch.isfinite(loss):
                raise RuntimeError(f"non-finite loss at epoch {epoch}: {loss.item()}")
            loss.backward()
            optimizer.step()
            optimizer.zero_grad(set_to_none=True)
            losses.append(float(loss.item()))
        mean_loss = sum(losses) / len(losses)
        loss_progression.append({"epoch": epoch, "mean_training_loss": mean_loss, "last_training_loss": losses[-1]})
        print(f"epoch={epoch} mean_training_loss={mean_loss:.6f}", flush=True)
        if epoch % 10 == 0:
            probe = generate_rows(model, tokenizer, rows)
            count = sum(item["valid"] for item in probe)
            best_count = max(best_count, count)
            if count > best_count:
                best_epoch = epoch
            if count >= 12:
                break
    model.config.use_cache = True
    MODEL_PATH.mkdir(parents=True, exist_ok=False)
    model.save_pretrained(MODEL_PATH)
    tokenizer.save_pretrained(MODEL_PATH)

    normal = generate_rows(model, tokenizer, rows)
    no_sentinels = generate_rows(model, tokenizer, rows, bad_words_ids=sentinel_bad_words_ids(tokenizer))
    structural_start = generate_rows(model, tokenizer, rows, bad_words_ids=sentinel_bad_words_ids(tokenizer), structural_start=True)
    diagnostics = {
        "base_model": "google/mt5-small",
        "device": torch.cuda.get_device_name(0),
        "precision": "FP32",
        "seed": 42,
        "samples": 12,
        "tokenizer_vocab_size": tokenizer_size,
        "model_embedding_size": embedding_size,
        "structural_token_ids": dict(zip(("<QUESTION>", "<OPTION_A>", "<OPTION_B>", "<OPTION_C>", "<OPTION_D>", "<CORRECT>", "<EXPLANATION>"), structural_token_ids(tokenizer))),
        "extra_id_0": tokenizer.convert_tokens_to_ids("<extra_id_0>"),
        "pad_token_id": tokenizer.pad_token_id,
        "eos_token_id": tokenizer.eos_token_id,
        "decoder_start_token_id": model.config.decoder_start_token_id,
        "label_audit": label_audit(rows, tokenizer),
        "training": {"epochs_completed": len(loss_progression), "steps": len(loss_progression) * 12, "batch_size": 1, "learning_rate": 1e-4, "loss_progression": loss_progression, "best_probe_parse_count": best_count, "best_probe_epoch": best_epoch},
        "first_step_diagnostics": [first_step_diagnostic(model, tokenizer, rows[2]), first_step_diagnostic(model, tokenizer, rows[3])],
        "parse_counts": {"normal": sum(item["valid"] for item in normal), "no_sentinels": sum(item["valid"] for item in no_sentinels), "structural_start": sum(item["valid"] for item in structural_start)},
        "pass_gate": max(sum(item["valid"] for item in normal), sum(item["valid"] for item in no_sentinels), sum(item["valid"] for item in structural_start)) >= 10,
    }
    write_json(OUTPUT_PATHS["normal"], normal)
    write_json(OUTPUT_PATHS["no_sentinels"], no_sentinels)
    write_json(OUTPUT_PATHS["structural_start"], structural_start)
    write_json(OUTPUT_PATHS["diagnostics"], diagnostics)
    print(json.dumps(diagnostics, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
