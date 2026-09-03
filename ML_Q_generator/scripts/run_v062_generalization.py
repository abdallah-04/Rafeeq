from __future__ import annotations

import json
import platform
import random
import re
import shutil
import sys
import time
from pathlib import Path

import numpy as np
import torch

ROOT = Path(__file__).resolve().parents[1]; sys.path.insert(0, str(ROOT / "src"))
from rafeeq_qg.runtime_paths import resolve_runtime_paths
from rafeeq_qg.v061_formats import parse_short
from rafeeq_qg.v062_hybrid import build_final, language_pass

DATA = ROOT / "data" / "v062" / "master_v062.jsonl"


def seed_all(seed: int) -> None:
    random.seed(seed); np.random.seed(seed); torch.manual_seed(seed)
    if torch.cuda.is_available(): torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True; torch.backends.cudnn.benchmark = False


def rows_for(split: str) -> list[dict]:
    rows = [json.loads(line) for line in DATA.read_text(encoding="utf-8").splitlines() if line.strip()]
    return [row for row in rows if row["split"] == split]


def clean_decode(tokenizer, ids: list[int]) -> str:
    excluded = {tokenizer.pad_token_id, tokenizer.eos_token_id}
    return tokenizer.decode([value for value in ids if value not in excluded], skip_special_tokens=False, clean_up_tokenization_spaces=False).strip()


def prepare(tokenizer, rows: list[dict]) -> list[dict]:
    return [{"row": row, "inputs": tokenizer(row["input_condition"], return_tensors="pt", max_length=128, truncation=True), "labels": tokenizer(row["targets"]["short_sentinel_v062"], return_tensors="pt", max_length=96, truncation=True)["input_ids"][0]} for row in rows]


def grounding(row: dict, parsed: dict | None) -> float:
    if not parsed: return 0.0
    source = set(re.findall(r"[\w\u0600-\u06FF]+", f"{row['topic']} {row['content']} {row['task_type']} {row['source_expected']['answer']}".casefold()))
    generated = set(re.findall(r"[\w\u0600-\u06FF]+", f"{parsed['question']} {parsed['explanation']}".casefold()))
    return len(source & generated) / len(generated) if generated else 0.0


def similarity(actual: str, expected: str) -> float:
    left, right = set(re.findall(r"[\w\u0600-\u06FF]+", actual.casefold())), set(re.findall(r"[\w\u0600-\u06FF]+", expected.casefold()))
    return len(left & right) / len(right) if right else 0.0


@torch.no_grad()
def generate(model, tokenizer, item: dict, beams: int) -> str:
    ids = model.generate(**{key: value.to(model.device) for key, value in item["inputs"].items()}, do_sample=False, num_beams=beams, max_new_tokens=96)[0].cpu().tolist()
    return clean_decode(tokenizer, ids)


@torch.no_grad()
def evaluate(model, tokenizer, prepared: list[dict]) -> list[dict]:
    model.eval(); output = []
    for item in prepared:
        attempts = []; parsed = None; last_error = None
        for beams in (1, 2, 4):
            raw = generate(model, tokenizer, item, beams); attempts.append(raw)
            try:
                candidate = parse_short(raw)
                if not language_pass(candidate["question"] + " " + candidate["explanation"], item["row"]["language"]):
                    last_error = "wrong_language"; continue
                parsed = candidate; break
            except ValueError as exc:
                last_error = str(exc)
        row = item["row"]; first_raw = attempts[0]; first = parse_result(row, first_raw); after = parse_result(row, attempts[-1])
        output.append({"id": row["id"], "input": row["input_condition"], "first_pass": first, "after_retry": after, "raw_attempts": attempts, "parsed": parsed, "attempts": len(attempts), "retry_used": len(attempts) > 1, "retry_error": last_error})
    return output


def parse_result(row: dict, raw: str) -> dict:
    try: parsed = parse_short(raw)
    except ValueError as exc: return {"strict_parse": False, "language_pass": False, "grounding": 0.0, "question_exact": False, "explanation_exact": False, "error": str(exc), "parsed": None}
    return {"strict_parse": True, "language_pass": language_pass(parsed["question"] + " " + parsed["explanation"], row["language"]), "grounding": grounding(row, parsed), "question_exact": parsed["question"] == row["training_expected"]["question"], "explanation_exact": parsed["explanation"] == row["training_expected"]["explanation"], "question_similarity": similarity(parsed["question"], row["training_expected"]["question"]), "explanation_similarity": similarity(parsed["explanation"], row["training_expected"]["explanation"]), "parsed": parsed}


def metrics(results: list[dict], phase: str) -> dict:
    values = [item[phase] for item in results]; return {"conditions": len(values), "strict_parse": sum(v["strict_parse"] for v in values), "language_pass": sum(v["language_pass"] for v in values), "mean_grounding": sum(v["grounding"] for v in values) / len(values), "question_exact": sum(v["question_exact"] for v in values), "explanation_exact": sum(v["explanation_exact"] for v in values), "mean_question_similarity": sum(v.get("question_similarity", 0.0) for v in values) / len(values), "mean_explanation_similarity": sum(v.get("explanation_similarity", 0.0) for v in values) / len(values)}


def validation_rank(m: dict, loss: float) -> tuple:
    return (m["strict_parse"], m["language_pass"], m["mean_grounding"], m["mean_question_similarity"], m["mean_explanation_similarity"], -loss)


def train_seed(seed: int, train_rows: list[dict], val_rows: list[dict], runtime, force: bool) -> dict:
    from transformers import Adafactor, AutoModelForSeq2SeqLM, AutoTokenizer, __version__ as transformers_version
    seed_all(seed); tokenizer = AutoTokenizer.from_pretrained("google/mt5-small", use_fast=False); model = AutoModelForSeq2SeqLM.from_pretrained("google/mt5-small").to("cuda"); model.config.use_cache = False
    train, val = prepare(tokenizer, train_rows), prepare(tokenizer, val_rows); optimizer = Adafactor(model.parameters(), lr=1e-3, relative_step=False, scale_parameter=False, warmup_init=False, clip_threshold=1.0, weight_decay=0.0); checkpoint = runtime.checkpoints_dir / f"rafeeq-mt5-qg-v0.6.2-seed{seed}"; report_path = runtime.outputs_dir / f"v062_seed{seed}.json"
    if force and checkpoint.exists(): shutil.rmtree(checkpoint)
    best = None; best_meta = None; stale = 0; history = []; started = time.perf_counter()
    for epoch in range(1, 11):
        model.train(); order = list(range(len(train))); random.Random(seed + epoch).shuffle(order); losses = []
        for index in order:
            item = train[index]; loss = model(**{key: value.to("cuda") for key, value in item["inputs"].items()}, labels=item["labels"].to("cuda").unsqueeze(0)).loss; loss.backward(); optimizer.step(); optimizer.zero_grad(set_to_none=True); losses.append(float(loss.item()))
        generated = evaluate(model, tokenizer, val); vloss = sum(float(model(**{key: value.to("cuda") for key, value in item["inputs"].items()}, labels=item["labels"].to("cuda").unsqueeze(0)).loss.item()) for item in val) / len(val); m = metrics(generated, "after_retry"); rank = validation_rank(m, vloss); record = {"epoch": epoch, "train_loss": sum(losses) / len(losses), "validation_loss": vloss, "validation_metrics": m, "first_pass_metrics": metrics(generated, "first_pass"), "average_attempts": sum(item["attempts"] for item in generated) / len(generated)}; history.append(record); print(f"seed={seed} epoch={epoch} loss={record['train_loss']:.4f} parse={m['strict_parse']}/60 language={m['language_pass']}/60 grounding={m['mean_grounding']:.3f}", flush=True)
        if best is None or rank > best: best, best_meta, stale = rank, record, 0; checkpoint.mkdir(parents=True, exist_ok=True); model.save_pretrained(checkpoint); tokenizer.save_pretrained(checkpoint)
        else:
            stale += 1
            if stale >= 3: break
    report = {"seed": seed, "base_model": "google/mt5-small", "optimizer": "Adafactor", "learning_rate": 1e-3, "precision": "FP32", "max_epochs": 10, "best_epoch": best_meta["epoch"], "best_validation": best_meta, "history": history, "checkpoint": str(checkpoint), "runtime_seconds": time.perf_counter() - started, "python_version": platform.python_version(), "pytorch_version": torch.__version__, "transformers_version": transformers_version, "cuda_version": torch.version.cuda, "gpu": torch.cuda.get_device_name(0)}; report_path.parent.mkdir(parents=True, exist_ok=True); report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"); del model; torch.cuda.empty_cache(); return report


def main() -> None:
    parser = __import__("argparse").ArgumentParser(); parser.add_argument("--force", action="store_true"); args = parser.parse_args()
    if not torch.cuda.is_available(): raise RuntimeError("CUDA required")
    runtime = resolve_runtime_paths(ROOT); [path.mkdir(parents=True, exist_ok=True) for path in (runtime.models_dir, runtime.checkpoints_dir, runtime.outputs_dir)]; train_rows, val_rows = rows_for("train"), rows_for("validation"); reports = [train_seed(seed, train_rows, val_rows, runtime, args.force) for seed in (42, 43, 44)]; winner = max(reports, key=lambda r: validation_rank(r["best_validation"]["validation_metrics"], r["best_validation"]["validation_loss"])); comparison = [{"seed": r["seed"], "best_epoch": r["best_epoch"], "best_validation": r["best_validation"], "checkpoint": r["checkpoint"]} for r in reports]; comparison.append({"selected_seed": winner["seed"], "selection": "validation only", "hidden_test_loaded": False}); (runtime.outputs_dir / "v062_validation_comparison.json").write_text(json.dumps(comparison, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    tokenizer = AutoTokenizer.from_pretrained(winner["checkpoint"], use_fast=False); model = AutoModelForSeq2SeqLM.from_pretrained(winner["checkpoint"]).to("cuda"); model.config.use_cache = True
    test_rows = rows_for("test"); test_results = evaluate(model, tokenizer, prepare(tokenizer, test_rows)); raw = metrics(test_results, "after_retry"); first = metrics(test_results, "first_pass"); finals = []; failures = []
    for item, row in zip(test_results, test_rows):
        if item["parsed"] is None: failures.append({"id": row["id"], "input": row["input_condition"], "raw_attempts": item["raw_attempts"], "failure": "model_parse_failure"}); continue
        try: final = build_final(row, item["parsed"]); finals.append({"id": row["id"], "model": item["parsed"], "final": final})
        except ValueError as exc: failures.append({"id": row["id"], "input": row["input_condition"], "raw_attempts": item["raw_attempts"], "failure": "deterministic_engine_failure", "detail": str(exc)})
    integrity = {"conditions": len(finals), "unique_options": sum(item["final"]["integrity"]["unique_options"] for item in finals), "answer_integrity": sum(item["final"]["integrity"]["answer_once"] for item in finals), "correct_letter_integrity": sum(item["final"]["integrity"]["letter_consistent"] for item in finals), "semantic_binding": sum(item["final"]["integrity"]["question_fact_binding"] for item in finals)}
    final_dir = runtime.models_dir / "rafeeq-mt5-qg-v0.6.2-final"; final_dir.mkdir(parents=True, exist_ok=True); model.save_pretrained(final_dir); tokenizer.save_pretrained(final_dir); payload = {"selected_seed": winner["seed"], "final_model_dir": str(final_dir), "model_first_pass": first, "model_after_fixed_retry": {**raw, "average_attempts": sum(item["attempts"] for item in test_results) / len(test_results)}, "final_hybrid_integrity": integrity, "validated_output_acceptance_rate": sum(all(item["final"]["integrity"].values()) for item in finals) / len(test_results), "failures": failures, "results": finals, "validation_comparison": comparison, "validation_or_test_loaded_after_selection": True}; (runtime.outputs_dir / "v062_final_hidden_test.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"); (runtime.outputs_dir / "v062_final_experiment_summary.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"); print(json.dumps({"selected_seed": winner["seed"], "first_pass": first, "after_retry": raw, "integrity": integrity}, ensure_ascii=False, indent=2))


if __name__ == "__main__": main()
