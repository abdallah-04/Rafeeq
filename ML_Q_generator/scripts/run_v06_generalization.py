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
from rafeeq_qg.hybrid import accept_v06_output, apply_math_hybrid, retry_language
from rafeeq_qg.runtime_paths import resolve_runtime_paths
from rafeeq_qg.v04_evaluation import aggregate_results, evaluate_raw_output, validation_rank

DATA = ROOT / "data" / "v06" / "master_v06.jsonl"
MANIFEST = ROOT / "data" / "v06" / "split_manifest_v06.json"


def rows_for(split: str) -> list[dict]:
    rows = [json.loads(line) for line in DATA.read_text(encoding="utf-8").splitlines() if line.strip()]
    return [row for row in rows if row["historical_split"] == split]


def set_seed(seed: int) -> None:
    random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def decode(tokenizer, ids: list[int]) -> str:
    excluded = {tokenizer.pad_token_id, tokenizer.eos_token_id}
    return tokenizer.decode([value for value in ids if value not in excluded], skip_special_tokens=False, clean_up_tokenization_spaces=False).strip()


def prepare(tokenizer, rows: list[dict]) -> list[dict]:
    return [{"row": row, "encoded": tokenizer(row["input_condition"], return_tensors="pt", truncation=True, max_length=128), "labels": tokenizer(row["targets"]["sentinel_native_v2"], return_tensors="pt", truncation=True, max_length=192)["input_ids"][0]} for row in rows]


@torch.no_grad()
def generate_once(model, tokenizer, item: dict, beams: int = 1) -> str:
    batch = {key: value.to(model.device) for key, value in item["encoded"].items()}
    ids = model.generate(**batch, do_sample=False, num_beams=beams, max_new_tokens=96)[0].cpu().tolist()
    return decode(tokenizer, ids)


@torch.no_grad()
def evaluate(model, tokenizer, prepared: list[dict]) -> list[dict]:
    model.eval()
    results = []
    for item in prepared:
        attempts = []
        raw = generate_once(model, tokenizer, item, beams=1)
        attempts.append(raw)
        first = evaluate_raw_output(item["row"], raw)
        parsed = first["parsed"] if first["strict_parse"] and "wrong_language" not in first["failure_categories"] else None
        while parsed is None and first["strict_parse"] and "wrong_language" in first["failure_categories"] and len(attempts) < 3:
            raw = generate_once(model, tokenizer, item, beams=len(attempts) + 1)
            attempts.append(raw)
            first = evaluate_raw_output(item["row"], raw)
            parsed = first["parsed"] if first["strict_parse"] and "wrong_language" not in first["failure_categories"] else None
        attempt_count = len(attempts)
        raw = attempts[-1] if attempts else ""
        result = evaluate_raw_output(item["row"], raw)
        result["first_pass"] = evaluate_raw_output(item["row"], attempts[0]) if attempts else result
        result["language_retry_attempts"] = attempt_count
        result["language_retry_used"] = attempt_count > 1
        result["parsed_after_retry"] = parsed
        hybrid = apply_math_hybrid(item["row"], parsed)
        result["hybrid_parsed"] = hybrid
        result["hybrid_acceptance"] = accept_v06_output(item["row"], parsed, hybrid=hybrid)
        result["raw_attempts"] = attempts
        results.append(result)
    return results


@torch.no_grad()
def validation_loss(model, prepared: list[dict]) -> float:
    model.eval(); values = []
    for item in prepared:
        batch = {key: value.to(model.device) for key, value in item["encoded"].items()}
        values.append(float(model(**batch, labels=item["labels"].to(model.device).unsqueeze(0)).loss.item()))
    return sum(values) / len(values)


def save_model(model, tokenizer, path: Path, metadata: dict) -> None:
    path.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(path)
    tokenizer.save_pretrained(path)
    (path / "selection_metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def breakdown(results: list[dict], field: str) -> dict:
    values = sorted({str(item[field]) for item in results})
    return {value: {"conditions": sum(str(item[field]) == value for item in results), "raw_strict_parse": sum(str(item[field]) == value and item["strict_parse"] for item in results), "raw_language_pass": sum(str(item[field]) == value and item["language_pass"] for item in results), "hybrid_accepted": sum(str(item[field]) == value and item["hybrid_acceptance"]["accepted"] for item in results)} for value in values}


def train_seed(seed: int, train_rows: list[dict], val_rows: list[dict], runtime, force: bool) -> dict:
    from transformers import Adafactor, AutoModelForSeq2SeqLM, AutoTokenizer
    checkpoint = runtime.checkpoints_dir / f"rafeeq-mt5-qg-v0.6-seed{seed}"
    report_path = runtime.outputs_dir / f"v06_seed{seed}.json"
    if not force and (checkpoint.exists() or report_path.exists()):
        raise RuntimeError(f"existing v0.6 artifacts for seed {seed}; use --force")
    if force and checkpoint.exists():
        shutil.rmtree(checkpoint)
    set_seed(seed)
    device = "cuda"
    tokenizer = AutoTokenizer.from_pretrained("google/mt5-small", use_fast=False)
    model = AutoModelForSeq2SeqLM.from_pretrained("google/mt5-small").to(device)
    if len(tokenizer) > model.get_input_embeddings().num_embeddings:
        raise RuntimeError("native tokenizer requires custom embedding resize")
    model.config.use_cache = False
    train_data, val_data = prepare(tokenizer, train_rows), prepare(tokenizer, val_rows)
    optimizer = Adafactor(model.parameters(), lr=1e-3, relative_step=False, scale_parameter=False, warmup_init=False, clip_threshold=1.0, weight_decay=0.0)
    best_rank = None; best_epoch = None; best_metrics = None; best_loss = None; history = []; stale = 0; started = time.perf_counter(); rng = random.Random(seed)
    for epoch in range(1, 4):
        order = list(range(len(train_data))); rng.shuffle(order); model.train(); losses = []
        for index in order:
            item = train_data[index]
            batch = {key: value.to(device) for key, value in item["encoded"].items()}
            loss = model(**batch, labels=item["labels"].to(device).unsqueeze(0)).loss
            if not torch.isfinite(loss):
                raise RuntimeError(f"non-finite loss seed {seed} epoch {epoch}")
            loss.backward(); optimizer.step(); optimizer.zero_grad(set_to_none=True); losses.append(float(loss.item()))
        vloss = validation_loss(model, val_data)
        generated = evaluate(model, tokenizer, val_data)
        metrics = aggregate_results(generated)
        rank = validation_rank(metrics, vloss)
        record = {"epoch": epoch, "train_loss": sum(losses) / len(losses), "validation_loss": vloss, "validation_metrics": metrics, "first_pass_language_count": sum(item["first_pass"]["language_pass"] for item in generated), "after_retry_language_count": sum(item["language_pass"] for item in generated)}
        history.append(record)
        print(f"seed={seed} epoch={epoch} train={record['train_loss']:.4f} val={vloss:.4f} parse={metrics['strict_parse_count']}/{len(val_rows)} accepted={sum(item['hybrid_acceptance']['accepted'] for item in generated)}/{len(val_rows)}", flush=True)
        if best_rank is None or rank > best_rank:
            best_rank, best_epoch, best_metrics, best_loss, stale = rank, epoch, metrics, vloss, 0
            save_model(model, tokenizer, checkpoint, {"seed": seed, "epoch": epoch, "validation_metrics": metrics, "validation_loss": vloss, "selection_rank": list(rank), "selection": "validation only"})
        else:
            stale += 1
            if stale >= 3:
                break
    report = {"run_name": f"rafeeq-mt5-qg-v0.6-seed{seed}", "base_model": "google/mt5-small", "serialization": "sentinel_native_v2", "optimizer": "Adafactor", "learning_rate": 1e-3, "precision": "FP32", "seeds": [42, 43, 44], "best_epoch": best_epoch, "best_validation_loss": best_loss, "best_validation_metrics": best_metrics, "history": history, "checkpoint": str(checkpoint), "runtime_seconds": time.perf_counter() - started}
    runtime.outputs_dir.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    del model
    torch.cuda.empty_cache()
    return report


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--force", action="store_true"); args = parser.parse_args()
    if not torch.cuda.is_available():
        raise RuntimeError("CUDA is required for the v0.6 generalization run")
    runtime = resolve_runtime_paths(ROOT)
    for path in (runtime.models_dir, runtime.checkpoints_dir, runtime.outputs_dir): path.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if manifest["counts"] != {"train": 360, "validation": 60, "test": 60} or manifest["v05_test_reuse_in_v06_hidden_test"]:
        raise RuntimeError("v0.6 split manifest is not the expected isolated 360/60/60 split")
    train_rows, val_rows = rows_for("train"), rows_for("validation")
    reports = [train_seed(seed, train_rows, val_rows, runtime, args.force) for seed in (42, 43, 44)]
    winner = max(reports, key=lambda report: tuple(report["best_validation_metrics"][key] for key in ("strict_parse_count", "answer_consistency_count", "exact_field_matches")))
    comparison = [{"seed": report["run_name"].split("seed")[-1], "best_epoch": report["best_epoch"], "validation_loss": report["best_validation_loss"], "validation_metrics": report["best_validation_metrics"], "checkpoint": report["checkpoint"]} for report in reports]
    comparison.append({"selected_seed": int(winner["run_name"].split("seed")[-1]), "selection": "validation only; hidden test not inspected"})
    (runtime.outputs_dir / "v06_validation_comparison.json").write_text(json.dumps(comparison, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    tokenizer = AutoTokenizer.from_pretrained(winner["checkpoint"], use_fast=False)
    model = AutoModelForSeq2SeqLM.from_pretrained(winner["checkpoint"]).to("cuda")
    model.config.use_cache = True
    test_rows = rows_for("test")
    test_results = evaluate(model, tokenizer, prepare(tokenizer, test_rows))
    test_metrics = aggregate_results(test_results)
    final_dir = runtime.models_dir / "rafeeq-mt5-qg-v0.6-final"
    save_model(model, tokenizer, final_dir, {"selected_seed": int(winner["run_name"].split("seed")[-1]), "selection": "validation only", "test_unlocked_after_selection": True})
    final = {"selected_seed": int(winner["run_name"].split("seed")[-1]), "selected_checkpoint": winner["checkpoint"], "final_model_dir": str(final_dir), "raw_model_test_metrics": test_metrics, "hybrid_accepted_count": sum(item["hybrid_acceptance"]["accepted"] for item in test_results), "hybrid_acceptance_rate": sum(item["hybrid_acceptance"]["accepted"] for item in test_results) / len(test_results), "hybrid_math_programmatic_count": sum(item["hybrid_acceptance"]["math_programmatic"] for item in test_results), "first_pass_language_count": sum(item["first_pass"]["language_pass"] for item in test_results), "after_retry_language_count": sum(item["language_pass"] for item in test_results), "breakdown": {"language": breakdown(test_results, "language"), "subject": breakdown(test_results, "subject"), "level": breakdown(test_results, "level")}, "v05_failure_analysis_path": "D:\\RafeeqML\\outputs\\v06_v05_failure_analysis.json", "test_results": test_results, "v05_test_reuse_in_v06_hidden_test": manifest["v05_test_reuse_in_v06_hidden_test"]}
    (runtime.outputs_dir / "v06_final_test_results.json").write_text(json.dumps(final, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (runtime.outputs_dir / "v06_final_experiment_summary.json").write_text(json.dumps({"comparison": comparison, "final": final}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"selected_seed": final["selected_seed"], "raw_model_test_metrics": test_metrics, "hybrid_acceptance_rate": final["hybrid_acceptance_rate"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__": main()
