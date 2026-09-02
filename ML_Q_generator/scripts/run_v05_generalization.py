from __future__ import annotations

import argparse
import json
import random
import shutil
import sys
import time
from pathlib import Path

import torch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from rafeeq_qg.runtime_paths import resolve_runtime_paths
from rafeeq_qg.v04_evaluation import aggregate_results, evaluate_raw_output, validation_rank

DATA = ROOT / "data" / "v05" / "master_v05.jsonl"
MANIFEST = ROOT / "data" / "v05" / "split_manifest_v05.json"


def rows_for(split: str) -> list[dict]:
    rows = [json.loads(line) for line in DATA.read_text(encoding="utf-8").splitlines() if line.strip()]
    return [row for row in rows if row["historical_split"] == split]


def set_seed(seed: int) -> None:
    random.seed(seed); torch.manual_seed(seed)
    if torch.cuda.is_available(): torch.cuda.manual_seed_all(seed)


def decode(tokenizer, ids: list[int]) -> str:
    excluded = {tokenizer.pad_token_id, tokenizer.eos_token_id}
    return tokenizer.decode([value for value in ids if value not in excluded], skip_special_tokens=False, clean_up_tokenization_spaces=False).strip()


def prepare(tokenizer, rows: list[dict]) -> list[dict]:
    return [{"row": row, "encoded": tokenizer(row["input_condition"], return_tensors="pt", truncation=True, max_length=128), "labels": tokenizer(row["targets"]["sentinel_native_v2"], return_tensors="pt", truncation=True, max_length=192)["input_ids"][0]} for row in rows]


@torch.no_grad()
def evaluate(model, tokenizer, prepared: list[dict]) -> list[dict]:
    model.eval(); results = []
    for item in prepared:
        batch = {key: value.to(model.device) for key, value in item["encoded"].items()}
        ids = model.generate(**batch, do_sample=False, max_new_tokens=96)[0].cpu().tolist()
        result = evaluate_raw_output(item["row"], decode(tokenizer, ids)); result["raw_token_ids"] = ids; results.append(result)
    return results


@torch.no_grad()
def validation_loss(model, prepared: list[dict]) -> float:
    model.eval(); values = []
    for item in prepared:
        batch = {key: value.to(model.device) for key, value in item["encoded"].items()}
        values.append(float(model(**batch, labels=item["labels"].to(model.device).unsqueeze(0)).loss.item()))
    return sum(values) / len(values)


@torch.no_grad()
def token_accuracy(model, prepared: list[dict]) -> float:
    model.eval(); correct = total = 0
    for item in prepared:
        batch = {key: value.to(model.device) for key, value in item["encoded"].items()}; labels = item["labels"].to(model.device).unsqueeze(0)
        logits = model(**batch, decoder_input_ids=model._shift_right(labels)).logits
        valid = labels != -100; correct += int((logits.argmax(-1)[valid] == labels[valid]).sum()); total += int(valid.sum())
    return correct / total if total else 0.0


def save_model(model, tokenizer, path: Path, metadata: dict) -> None:
    path.mkdir(parents=True, exist_ok=True); model.save_pretrained(path); tokenizer.save_pretrained(path)
    (path / "selection_metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def train_seed(seed: int, train_rows: list[dict], val_rows: list[dict], runtime, force: bool) -> dict:
    from transformers import Adafactor, AutoModelForSeq2SeqLM, AutoTokenizer
    name = f"rafeeq-mt5-qg-v0.5-seed{seed}"; checkpoint = runtime.checkpoints_dir / name; report_path = runtime.outputs_dir / f"v05_seed{seed}.json"
    if not force and (checkpoint.exists() or report_path.exists()): raise RuntimeError(f"existing v0.5 artifacts for seed {seed}; use --force")
    if force and checkpoint.exists(): shutil.rmtree(checkpoint)
    set_seed(seed); tokenizer = AutoTokenizer.from_pretrained("google/mt5-small", use_fast=False); model = AutoModelForSeq2SeqLM.from_pretrained("google/mt5-small").to("cuda")
    if len(tokenizer) > model.get_input_embeddings().num_embeddings: raise RuntimeError("native embedding matrix too small")
    train_data, val_data = prepare(tokenizer, train_rows), prepare(tokenizer, val_rows); model.config.use_cache = False
    optimizer = Adafactor(model.parameters(), lr=1e-3, relative_step=False, scale_parameter=False, warmup_init=False, clip_threshold=1.0, weight_decay=0.0)
    best_rank = None; best_epoch = None; best_metrics = None; best_loss = None; history = []; stale = 0; started = time.perf_counter(); rng = random.Random(seed)
    for epoch in range(1, 11):
        order = list(range(len(train_data))); rng.shuffle(order); model.train(); losses = []
        for index in order:
            item = train_data[index]; batch = {key: value.to("cuda") for key, value in item["encoded"].items()}; loss = model(**batch, labels=item["labels"].to("cuda").unsqueeze(0)).loss
            if not torch.isfinite(loss): raise RuntimeError(f"non-finite loss seed {seed} epoch {epoch}")
            loss.backward(); optimizer.step(); optimizer.zero_grad(set_to_none=True); losses.append(float(loss.item()))
        vloss = validation_loss(model, val_data); generated = evaluate(model, tokenizer, val_data); metrics = aggregate_results(generated); rank = validation_rank(metrics, vloss); record = {"epoch": epoch, "train_loss": sum(losses)/len(losses), "validation_loss": vloss, "validation_metrics": metrics, "teacher_forced_token_accuracy": token_accuracy(model, val_data), "selection_rank": list(rank)}; history.append(record)
        print(f"seed={seed} epoch={epoch} train={record['train_loss']:.4f} val={vloss:.4f} parse={metrics['strict_parse_count']}/60 answer={metrics['answer_consistency_count']}/60", flush=True)
        if best_rank is None or rank > best_rank:
            best_rank, best_epoch, best_metrics, best_loss, stale = rank, epoch, metrics, vloss, 0; save_model(model, tokenizer, checkpoint, {"seed": seed, "epoch": epoch, "validation_metrics": metrics, "validation_loss": vloss, "selection_rank": list(rank)})
        else:
            stale += 1
            if stale >= 3: break
    report = {"run_name": name, "seed": seed, "base_model": "google/mt5-small", "serialization": "sentinel_native_v2", "optimizer": "Adafactor", "learning_rate": 1e-3, "precision": "FP32", "per_device_batch": 1, "gradient_accumulation": 1, "best_epoch": best_epoch, "best_validation_loss": best_loss, "best_validation_metrics": best_metrics, "history": history, "checkpoint": str(checkpoint), "runtime_seconds": time.perf_counter()-started}
    runtime.outputs_dir.mkdir(parents=True, exist_ok=True); report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"); del model; torch.cuda.empty_cache(); return report


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--force", action="store_true"); args = parser.parse_args()
    if not torch.cuda.is_available(): raise RuntimeError("CUDA is required")
    runtime = resolve_runtime_paths(ROOT); [path.mkdir(parents=True, exist_ok=True) for path in (runtime.models_dir, runtime.checkpoints_dir, runtime.outputs_dir)]
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")); train_rows, val_rows = rows_for("train"), rows_for("validation")
    if manifest["counts"] != {"train": 360, "validation": 60, "test": 60}: raise RuntimeError("unexpected frozen split counts")
    reports = [train_seed(seed, train_rows, val_rows, runtime, args.force) for seed in (42, 43, 44)]
    winner = max(reports, key=lambda report: tuple(report["best_validation_metrics"][key] for key in ("strict_parse_count", "answer_consistency_count", "exact_field_matches")))
    comparison = [{"seed": report["seed"], "best_epoch": report["best_epoch"], "validation_loss": report["best_validation_loss"], "validation_metrics": report["best_validation_metrics"], "checkpoint": report["checkpoint"]} for report in reports] + [{"selected_seed": winner["seed"]}]
    (runtime.outputs_dir / "v05_validation_comparison.json").write_text(json.dumps(comparison, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    tokenizer = AutoTokenizer.from_pretrained(winner["checkpoint"], use_fast=False); model = AutoModelForSeq2SeqLM.from_pretrained(winner["checkpoint"]).to("cuda"); model.config.use_cache = True
    test_rows = rows_for("test"); test_results = evaluate(model, tokenizer, prepare(tokenizer, test_rows)); test_metrics = aggregate_results(test_results)
    final_dir = runtime.models_dir / "rafeeq-mt5-qg-v0.5-final"; save_model(model, tokenizer, final_dir, {"selected_seed": winner["seed"], "selection": "validation only", "test_unlocked_after_selection": True})
    final = {"selected_seed": winner["seed"], "selected_checkpoint": winner["checkpoint"], "final_model_dir": str(final_dir), "test": {"metrics": test_metrics, "results": test_results}, "v04_test_is_historical_only": True, "master_training_run": False}
    (runtime.outputs_dir / "v05_final_test_results.json").write_text(json.dumps(final["test"], ensure_ascii=False, indent=2) + "\n", encoding="utf-8"); (runtime.outputs_dir / "v05_final_experiment_summary.json").write_text(json.dumps({"comparison": comparison, "final": final}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"); print(json.dumps({"selected_seed": winner["seed"], "test_metrics": test_metrics}, ensure_ascii=False, indent=2))


if __name__ == "__main__": main()
