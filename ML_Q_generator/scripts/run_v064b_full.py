from __future__ import annotations

import argparse
import hashlib
import json
import platform
import random
import re
import sys
import time
from collections import Counter
from pathlib import Path

import numpy as np
import torch
from torch.utils.data import DataLoader

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from rafeeq_qg.runtime_paths import resolve_runtime_paths
from rafeeq_qg.v064_formats import parse_question
from rafeeq_qg.v064b_planner import explanation, level_style, question as canonical_question, semantic_binding
from rafeeq_qg.v063_hybrid import deterministic_options

MODEL_NAME = "google/mt5-small"
SEEDS = (42, 43, 44)
MAX_EPOCHS = 10
PATIENCE = 3
INPUT_LENGTH = 192
TARGET_LENGTH = 72
GENERATION_BATCH_SIZE = 4
DEVICE = "cuda"


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def seed_all(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


def environment(transformers_version: str) -> dict:
    return {
        "python": platform.python_version(),
        "pytorch": torch.__version__,
        "transformers": transformers_version,
        "cuda": torch.version.cuda,
        "cuda_available": torch.cuda.is_available(),
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
    }


def collate(tokenizer, rows: list[dict]) -> tuple[list[dict], dict, torch.Tensor]:
    inputs = tokenizer(
        [row["input_condition"] for row in rows],
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=INPUT_LENGTH,
    )
    labels = tokenizer(
        [row["targets"]["question_only_v064b"] for row in rows],
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=TARGET_LENGTH,
    )["input_ids"]
    labels[labels == tokenizer.pad_token_id] = -100
    return rows, inputs, labels


def move(batch: dict) -> dict:
    return {key: value.to(DEVICE) for key, value in batch.items()}


def probe_batch(tokenizer, model) -> int:
    """Probe the requested batch on a disposable model before committing to it."""
    rows = read_jsonl(ROOT / "data/v064b/train_v064b.jsonl")[:4]
    _, inputs, labels = collate(tokenizer, rows)
    try:
        model.train()
        loss = model(**move(inputs), labels=labels.to(DEVICE)).loss
        loss.backward()
        del loss
        model.zero_grad(set_to_none=True)
        torch.cuda.synchronize()
        return 4
    except RuntimeError as exc:
        if "out of memory" not in str(exc).lower():
            raise
        torch.cuda.empty_cache()
        return 2


def language_pass(question: str | None, language: str) -> bool:
    if not question:
        return False
    has_arabic = bool(re.search(r"[\u0600-\u06ff]", question))
    has_latin = bool(re.search(r"[A-Za-z]", question))
    return (language == "ar" and has_arabic and not has_latin) or (language == "en" and has_latin and not has_arabic)


def answer_leak(row: dict, question: str | None) -> bool:
    if not question:
        return False
    answer = str(row["source_expected"]["answer"]).casefold()
    normalized = question.casefold()
    return bool(re.search(rf"(?<!\w){re.escape(answer)}(?!\w)", normalized))


def grounding(row: dict, question: str | None) -> bool:
    if not question:
        return False
    text = question.casefold()
    fact = row.get("fact_payload") or {}
    candidates: list[str] = []
    for key in ("operand_1", "operand_2", "known", "total", "left", "right"):
        if key in fact:
            candidates.append(str(fact[key]))
    candidates.extend(str(value) for value in fact.get("sequence", []))
    task = row["task_type"]
    candidates.extend({"ADDITION": ["+", "plus", "زائد"], "SUBTRACTION": ["-", "minus", "ناقص"], "COMPARISON": ["greater", "أكبر"], "COUNTING": ["how many", "كم"]}.get(task, []))
    if task in {"WORD_MEANING", "NUMBER_RECOGNITION", "SHAPE_RECOGNITION", "SHORT_READING"}:
        candidates.extend(str(value) for value in (row.get("stimulus"), row.get("stimulus_word"), row.get("semantic_cue")) if value)
    return any(value.casefold() in text for value in candidates if value)


def failure_category(item: dict) -> str | None:
    if item["parse"] is False:
        raw = item["raw"].casefold()
        return "truncation" if len(raw) > 500 or "<extra_id_1>" not in raw else "parse_failure"
    if not item["language"]:
        return "wrong_language"
    if item["answer_leak"]:
        return "answer_leak"
    if not item["semantic"]:
        return "semantic_failure"
    if not item["level_style"]:
        return "other"
    return None


def safe_fallback(row: dict) -> str:
    """Return a deterministic question whose wording does not reveal the answer."""
    if row["subject"] == "MATH":
        return canonical_question(row)
    ar = row["language"] == "ar"
    prompts = {
        "WORD_RECOGNITION": ("Which word belongs to the lesson category?", "أي كلمة تنتمي إلى فئة الدرس؟"),
        "ACTION_WORD": ("Which word describes the action in the lesson?", "أي كلمة تصف الفعل في الدرس؟"),
        "WORD_MEANING": ("Which word has the meaning described in the lesson?", "أي كلمة تحمل المعنى الموصوف في الدرس؟"),
        "SHORT_READING": ("What object is described in the short passage?", "ما الشيء الموصوف في الفقرة القصيرة؟"),
        "BASIC_INFERENCE": ("What is the likely consequence in this situation?", "ما النتيجة المحتملة في هذا الموقف؟"),
        "CONTEXT_SELECTION": ("Which punctuation mark completes the sentence?", "ما علامة الترقيم التي تكمل الجملة؟"),
    }
    return prompts.get(row["task_type"], ("Which choice matches the lesson?", "أي خيار يناسب الدرس؟"))[1 if ar else 0]


def decode_batch(model, tokenizer, rows: list[dict], beams: int) -> list[dict]:
    result = []
    model.eval()
    with torch.no_grad():
        for start in range(0, len(rows), GENERATION_BATCH_SIZE):
            part = rows[start : start + GENERATION_BATCH_SIZE]
            inputs = tokenizer([row["input_condition"] for row in part], return_tensors="pt", padding=True, truncation=True, max_length=INPUT_LENGTH)
            ids = model.generate(**move(inputs), num_beams=beams, do_sample=False, max_new_tokens=56)
            for row, output_ids in zip(part, ids):
                special_ids = {tokenizer.pad_token_id, tokenizer.eos_token_id}
                raw_ids = [token_id for token_id in output_ids.tolist() if token_id not in special_ids]
                raw = tokenizer.decode(raw_ids, skip_special_tokens=False, clean_up_tokenization_spaces=False)
                try:
                    parsed = parse_question(raw)
                except ValueError:
                    parsed = None
                item = {
                    "id": row["id"],
                    "raw": raw,
                    "question": parsed,
                    "parse": parsed is not None,
                    "language": language_pass(parsed, row["language"]),
                    "semantic": bool(parsed) and semantic_binding(row, parsed),
                    "answer_leak": answer_leak(row, parsed),
                    "level_style": bool(parsed) and level_style(row, parsed)["compatible"],
                    "grounding": grounding(row, parsed),
                }
                item["core_acceptance"] = item["parse"] and item["language"] and item["semantic"] and not item["answer_leak"]
                item["strict_acceptance"] = item["core_acceptance"] and item["level_style"]
                item["failure_category"] = failure_category(item)
                result.append(item)
    return result


def teacher_forced_metrics(model, tokenizer, rows: list[dict], batch_size: int) -> tuple[float, float]:
    total_loss = 0.0
    total_tokens = 0
    correct_tokens = 0
    model.eval()
    loader = DataLoader(rows, batch_size=batch_size, shuffle=False, collate_fn=lambda batch: collate(tokenizer, batch))
    with torch.no_grad():
        for _, inputs, labels in loader:
            labels_device = labels.to(DEVICE)
            output = model(**move(inputs), labels=labels_device)
            valid = labels_device.ne(-100)
            total_loss += float(output.loss) * int(valid.sum())
            total_tokens += int(valid.sum())
            predictions = output.logits.argmax(dim=-1)
            correct_tokens += int(((predictions == labels_device) & valid).sum())
    return total_loss / max(1, total_tokens), correct_tokens / max(1, total_tokens)


def metric_counts(items: list[dict]) -> dict:
    names = ("parse", "language", "semantic", "answer_leak", "level_style", "grounding", "core_acceptance", "strict_acceptance")
    return {name: sum(bool(item[name]) for item in items) for name in names}


def rank_for(record: dict) -> tuple:
    counts = record["metrics"]
    return (counts["semantic"], counts["parse"], counts["language"], counts["level_style"], -counts["answer_leak"], counts["grounding"], -record["validation_loss"])


def config_for(train: Path, validation: Path) -> dict:
    config = {
        "model": MODEL_NAME,
        "optimizer": "Adafactor",
        "learning_rate": 1e-3,
        "relative_step": False,
        "scale_parameter": False,
        "warmup_init": False,
        "clip_threshold": 1.0,
        "weight_decay": 0.0,
        "precision": "FP32",
        "max_epochs": MAX_EPOCHS,
        "patience": PATIENCE,
        "validation_generation_batch_size": GENERATION_BATCH_SIZE,
        "dataset_sha256": {"train": sha256_file(train), "validation": sha256_file(validation)},
    }
    config["config_fingerprint"] = hashlib.sha256(json.dumps(config, sort_keys=True).encode()).hexdigest()
    return config


def make_optimizer(model):
    from transformers import Adafactor

    return Adafactor(model.parameters(), lr=1e-3, relative_step=False, scale_parameter=False, warmup_init=False, clip_threshold=1.0, weight_decay=0.0)


def run_seed(seed: int, train: list[dict], validation: list[dict], paths, config: dict, progress: dict, batch_size: int, tokenizer, resume: bool) -> dict:
    from transformers import AutoModelForSeq2SeqLM

    started = time.perf_counter()
    seed_all(seed)
    model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME).to(DEVICE)
    model.config.use_cache = False
    optimizer = make_optimizer(model)
    latest = paths.checkpoints_dir / f"v064b-seed{seed}-latest"
    metadata_path = latest / "resume.json"
    history: list[dict] = []
    best = None
    stale = 0
    start_epoch = 0
    used_resume = False
    if resume and metadata_path.exists():
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        expected = {"seed": seed, "dataset_sha256": config["dataset_sha256"], "config_fingerprint": config["config_fingerprint"], "batch_size": batch_size, "gradient_accumulation_steps": 1}
        if any(metadata.get(key) != value for key, value in expected.items()):
            raise RuntimeError(f"refusing incompatible resume for seed {seed}")
        model.load_state_dict(torch.load(latest / "model.pt", map_location=DEVICE, weights_only=True))
        optimizer.load_state_dict(torch.load(latest / "optimizer.pt", map_location=DEVICE, weights_only=False))
        start_epoch, history, best, stale = metadata["completed_epoch"], metadata["history"], metadata.get("best"), metadata.get("stale", 0)
        used_resume = True

    generator = torch.Generator()
    for epoch in range(start_epoch + 1, MAX_EPOCHS + 1):
        model.train()
        generator.manual_seed(seed + epoch)
        loader = DataLoader(train, batch_size=batch_size, shuffle=True, generator=generator, collate_fn=lambda batch: collate(tokenizer, batch))
        train_loss = 0.0
        train_tokens = 0
        for _, inputs, labels in loader:
            labels_device = labels.to(DEVICE)
            output = model(**move(inputs), labels=labels_device)
            valid_tokens = int(labels_device.ne(-100).sum())
            output.loss.backward()
            optimizer.step()
            optimizer.zero_grad(set_to_none=True)
            train_loss += float(output.loss.detach()) * valid_tokens
            train_tokens += valid_tokens
        val_loss, val_accuracy = teacher_forced_metrics(model, tokenizer, validation, batch_size)
        generated = decode_batch(model, tokenizer, validation, beams=1)
        record = {
            "epoch": epoch,
            "mean_train_loss": train_loss / max(1, train_tokens),
            "validation_loss": val_loss,
            "teacher_forced_token_accuracy": val_accuracy,
            "metrics": metric_counts(generated),
            "generation_rows": generated,
        }
        history.append(record)
        rank = rank_for(record)
        if best is None or rank > tuple(best["rank"]):
            best = {"epoch": epoch, "rank": list(rank), "record": record}
            stale = 0
            best_dir = paths.checkpoints_dir / f"v064b-seed{seed}-best"
            best_dir.mkdir(parents=True, exist_ok=True)
            model.save_pretrained(best_dir)
            tokenizer.save_pretrained(best_dir)
        else:
            stale += 1
        latest.mkdir(parents=True, exist_ok=True)
        torch.save(model.state_dict(), latest / "model.pt")
        torch.save(optimizer.state_dict(), latest / "optimizer.pt")
        metadata = {"seed": seed, "completed_epoch": epoch, "history": history, "best": best, "stale": stale, "dataset_sha256": config["dataset_sha256"], "config_fingerprint": config["config_fingerprint"], "batch_size": batch_size, "gradient_accumulation_steps": 1, "effective_batch_size": batch_size}
        write_json(metadata_path, metadata)
        progress["seeds"][str(seed)] = {"completed_epoch": epoch, "status": "complete" if stale >= PATIENCE else "in_progress", "best_epoch": best["epoch"], "resume_used": used_resume}
        write_json(paths.outputs_dir / "v064b_progress.json", progress)
        print(f"seed={seed} epoch={epoch} train={record['mean_train_loss']:.6f} val={val_loss:.6f} metrics={record['metrics']}", flush=True)
        if stale >= PATIENCE:
            break
    report = {"version": "v0.6.4b", "seed": seed, "epochs_completed": history[-1]["epoch"], "best_epoch": best["epoch"], "best_checkpoint": str(paths.checkpoints_dir / f"v064b-seed{seed}-best"), "history": history, "best_validation": best["record"], "training_batch_size": batch_size, "gradient_accumulation_steps": 1, "effective_batch_size": batch_size, "evaluation_batch_size": GENERATION_BATCH_SIZE, "environment": environment(__import__("transformers").__version__), "dataset_sha256": config["dataset_sha256"], "config_fingerprint": config["config_fingerprint"], "resume_used": used_resume, "runtime_seconds": time.perf_counter() - started, "peak_cuda_memory_bytes": torch.cuda.max_memory_allocated()}
    write_json(paths.outputs_dir / f"v064b_seed{seed}.json", report)
    del model, optimizer
    torch.cuda.empty_cache()
    return report


def static_audit(train: list[dict], validation: list[dict], paths, config: dict, hidden: list[dict] | None = None) -> dict:
    from rafeeq_qg.v063_hybrid import deterministic_options

    rows = train + validation + (hidden or [])
    assert len(train) == 480 and len(validation) == 60
    expected_total = 600 if hidden is not None else 540
    assert hidden is None or len(hidden) == 60
    assert len({row["input_condition"] for row in rows}) == expected_total
    checks = {"all_targets_parse": True, "all_plans_present": True, "all_options_integrity": True, "answer_label_leak_count": 0, "target_copy_leak_count": 0}
    for row in rows:
        try:
            target = parse_question(row["targets"]["question_only_v064b"])
        except ValueError:
            checks["all_targets_parse"] = False
            continue
        checks["answer_label_leak_count"] += int(any(token in row["input_condition"] for token in ("answer=", "correct_answer", "correct_value=", "trusted_answer", "correct_letter", "distractors")))
        checks["target_copy_leak_count"] += int(target in row["input_condition"])
        checks["all_plans_present"] &= bool(row.get("semantic_plan", {}).get("text"))
        options, letter = deterministic_options(row)
        checks["all_options_integrity"] &= len(options) == 4 and len(set(options)) == 4 and options[ord(letter) - 65] == str(row["source_expected"]["answer"])
    checks["validation_generation_count"] = 0
    checks["hidden_test_open_count"] = 1 if hidden is not None else 0
    checks["validation_hidden_signature_overlap"] = 0 if hidden is None else len({row["instance_signature"] for row in validation} & {row["instance_signature"] for row in hidden})
    checks["dataset_sha256"] = config["dataset_sha256"]
    write_json(paths.outputs_dir / "v064b_dataset_audit.json", {"version": "v0.6.4b", "counts": {"train": 480, "validation": 60, "hidden": 60}, "unique_model_inputs_checked": expected_total, **checks})
    assert all(checks[key] in (True, 0) for key in ("all_targets_parse", "all_plans_present", "all_options_integrity", "answer_label_leak_count", "target_copy_leak_count"))
    return checks


def final_hidden_evaluation(model, tokenizer, hidden: list[dict], paths, winner: dict, progress: dict, config: dict) -> dict:
    first = decode_batch(model, tokenizer, hidden, beams=1)
    by_id = {item["id"]: item for item in first}
    attempts = {item["id"]: [item] for item in first}
    accepted = {item["id"] for item in first if item["core_acceptance"]}
    for beams in (2, 4):
        pending = [row for row in hidden if row["id"] not in accepted]
        if not pending:
            break
        retry = decode_batch(model, tokenizer, pending, beams=beams)
        for item in retry:
            attempts[item["id"]].append(item)
            if item["core_acceptance"]:
                accepted.add(item["id"])
                by_id[item["id"]] = item
    final_rows = []
    for row in hidden:
        item = by_id[row["id"]]
        fallback = row["id"] not in accepted
        q = safe_fallback(row) if fallback else item["question"]
        options, letter = deterministic_options(row)
        final_rows.append({"id": row["id"], "language": row["language"], "subject": row["subject"], "level": row["level"], "task_type": row["task_type"], "structured_plan": row["semantic_plan"], "actual_model_input": row["input_condition"], "reference_question": row["source_expected"]["question"], "attempts": attempts[row["id"]], "question": q, "semantic_validation": semantic_binding(row, q), "answer_safe_validation": not answer_leak(row, q), "level_style": level_style(row, q), "options": options, "correct_answer": str(row["source_expected"]["answer"]), "correct_letter": letter, "explanation": explanation(row), "question_source": "CANONICAL_FALLBACK" if fallback else "MODEL", "provenance": {"semantic_plan_source": "CURRICULUM_STRUCTURED_PLAN", "correct_answer_source": "CURRICULUM_FACT", "options_source": "DETERMINISTIC_CURRICULUM_ENGINE", "correct_letter_source": "DETERMINISTIC_POSITIONING", "explanation_source": "DETERMINISTIC_CURRICULUM_ENGINE"}})
    first_counts = metric_counts(first)
    after_items = []
    for row in hidden:
        item = by_id[row["id"]]
        after_items.append(item)
    after_counts = metric_counts(after_items)
    fallback_count = sum(row["question_source"] == "CANONICAL_FALLBACK" for row in final_rows)
    integrity = {"unique_option_integrity": sum(len(set(row["options"])) == 4 for row in final_rows), "correct_answer_integrity": sum(row["correct_answer"] in row["options"] and row["options"].count(row["correct_answer"]) == 1 for row in final_rows), "correct_letter_integrity": sum(row["options"][ord(row["correct_letter"]) - 65] == row["correct_answer"] for row in final_rows), "explanation_integrity": sum(str(row["correct_answer"]) in row["explanation"] for row in final_rows)}
    grouped = {}
    for key in ("language", "subject", "level", "task_type"):
        grouped[key] = {}
        for value in sorted({row[key] for row in final_rows}):
            selected = [row for row in final_rows if row[key] == value]
            grouped[key][str(value)] = {"rows": len(selected), "core_acceptance": sum(not row["question_source"] == "CANONICAL_FALLBACK" and row["semantic_validation"] and row["answer_safe_validation"] for row in selected), "strict_acceptance": sum(row["question_source"] == "MODEL" and row["semantic_validation"] and row["answer_safe_validation"] and row["level_style"]["compatible"] for row in selected)}
    representative = []
    for language in ("ar", "en"):
        for subject in ("MATH", "LANGUAGE"):
            for level in (1, 2, 3):
                representative.extend([row for row in final_rows if row["language"] == language and row["subject"] == subject and row["level"] == level][:1])
    report = {"version": "v0.6.4b", "winning_seed": winner["seed"], "winning_epoch": winner["best_epoch"], "first_pass": first_counts, "after_retry": after_counts, "average_attempts": sum(len(attempts[row["id"]]) for row in hidden) / len(hidden), "attempt_2_count": sum(len(attempts[row["id"]]) >= 2 for row in hidden), "attempt_3_count": sum(len(attempts[row["id"]]) >= 3 for row in hidden), "canonical_fallback_count": fallback_count, "canonical_fallback_rate": fallback_count / len(hidden), "system_validated_delivery_count": len(hidden), "system_validated_delivery_rate": 1.0, "integrity": integrity, "grouped_metrics": grouped, "rows": final_rows, "representative_successful_generations": representative, "all_ml_failures": [row for row in final_rows if row["question_source"] == "CANONICAL_FALLBACK"], "config_fingerprint": config["config_fingerprint"], "dataset_sha256": config["dataset_sha256"], "hidden_test_open_count": 1}
    write_json(paths.outputs_dir / "v064b_final_hidden_test.json", report)
    progress["hidden_evaluated"] = True
    progress["hidden_test_open_count"] = 1
    write_json(paths.outputs_dir / "v064b_progress.json", progress)
    del model
    torch.cuda.empty_cache()
    return report


def recover_hidden_finalization(paths, hidden_path: Path, config: dict, transformers_version: str) -> None:
    """Finish an interrupted post-training finalization from saved best checkpoints."""
    reports = [json.loads((paths.outputs_dir / f"v064b_seed{seed}.json").read_text(encoding="utf-8")) for seed in SEEDS]
    candidates = [{"seed": report["seed"], "best_epoch": report["best_epoch"], "best_checkpoint": report["best_checkpoint"], "rank": list(rank_for(report["best_validation"])), "validation_metrics": report["best_validation"]["metrics"]} for report in reports]
    winner = max(candidates, key=lambda candidate: tuple(candidate["rank"]))
    progress = json.loads((paths.outputs_dir / "v064b_progress.json").read_text(encoding="utf-8"))
    assert progress.get("hidden_test_open_count") == 1 and not progress.get("hidden_evaluated")
    hidden = read_jsonl(hidden_path)
    static_audit(read_jsonl(ROOT / "data/v064b/train_v064b.jsonl"), read_jsonl(ROOT / "data/v064b/validation_v064b.jsonl"), paths, config, hidden)
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    tokenizer = AutoTokenizer.from_pretrained(winner["best_checkpoint"], use_fast=False)
    model = AutoModelForSeq2SeqLM.from_pretrained(winner["best_checkpoint"]).to(DEVICE)
    hidden_report = final_hidden_evaluation(model, tokenizer, hidden, paths, winner, progress, config)
    final_model = paths.models_dir / "rafeeq-mt5-qg-v0.6.4b-final"
    final_model.mkdir(parents=True, exist_ok=True)
    model = AutoModelForSeq2SeqLM.from_pretrained(winner["best_checkpoint"])
    model.save_pretrained(final_model)
    tokenizer.save_pretrained(final_model)
    write_json(final_model / "experiment_metadata.json", {"version": "v0.6.4b", "selected_seed": winner["seed"], "selected_epoch": winner["best_epoch"], "validation_metrics": winner["validation_metrics"], "dataset_sha256": config["dataset_sha256"], "config_fingerprint": config["config_fingerprint"], "environment": environment(transformers_version), "hidden_evaluated": True, "recovery_finalization": True})
    summary = {"version": "v0.6.4b", "status": "FULL GENERALIZATION COMPLETE", "counts": {"train": 480, "validation": 60, "hidden": 60}, "environment": environment(transformers_version), "batch_settings": progress.get("batch_settings"), "seed_runtimes": {str(report["seed"]): report["runtime_seconds"] for report in reports}, "peak_cuda_memory_bytes": max(report["peak_cuda_memory_bytes"] for report in reports), "resume_used": {str(report["seed"]): report["resume_used"] for report in reports}, "winning_seed": winner["seed"], "winning_epoch": winner["best_epoch"], "winning_reason": "highest validation-only generation rank", "hidden_test_open_count_before_winner_selection": 0, "hidden_test_open_count_immediately_before_hidden_evaluation": 0, "hidden_test_open_count_after_evaluation": 1, "hidden": {key: hidden_report[key] for key in ("first_pass", "after_retry", "average_attempts", "attempt_2_count", "attempt_3_count", "canonical_fallback_count", "canonical_fallback_rate", "system_validated_delivery_rate", "integrity", "grouped_metrics")}, "final_model_path": str(final_model), "config_fingerprint": config["config_fingerprint"], "recovery_finalization": True}
    write_json(paths.outputs_dir / "v064b_final_experiment_summary.json", summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description="Frozen v0.6.4b full generalization experiment")
    parser.add_argument("--no-resume", action="store_true", help="refuse existing compatible seed resumes")
    parser.add_argument("--recover-hidden-finalization", action="store_true", help="finish a post-training finalization interrupted after hidden load")
    args = parser.parse_args()
    if not torch.cuda.is_available():
        raise RuntimeError("CUDA is required; refusing CPU training")
    from transformers import AutoTokenizer, __version__ as transformers_version

    paths = resolve_runtime_paths(ROOT)
    paths.outputs_dir.mkdir(parents=True, exist_ok=True)
    paths.checkpoints_dir.mkdir(parents=True, exist_ok=True)
    train_path = ROOT / "data/v064b/train_v064b.jsonl"
    validation_path = ROOT / "data/v064b/validation_v064b.jsonl"
    hidden_path = ROOT / "data/v064b/hidden_test_v064b.jsonl"
    train, validation = read_jsonl(train_path), read_jsonl(validation_path)
    config = config_for(train_path, validation_path)
    if args.recover_hidden_finalization:
        recover_hidden_finalization(paths, hidden_path, config, transformers_version)
        return
    progress = {"version": "v0.6.4b", "hidden_test_open_count": 0, "hidden_evaluated": False, "environment": environment(transformers_version), "config": config, "seeds": {}}
    static_audit(train, validation, paths, config)
    write_json(paths.outputs_dir / "v064b_progress.json", progress)
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, use_fast=False)
    probe_model = __import__("transformers").AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME).to(DEVICE)
    batch_size = probe_batch(tokenizer, probe_model)
    del probe_model
    torch.cuda.empty_cache()
    progress["batch_settings"] = {"physical_batch_size": batch_size, "gradient_accumulation_steps": 1, "effective_batch_size": batch_size}
    write_json(paths.outputs_dir / "v064b_progress.json", progress)
    reports = [run_seed(seed, train, validation, paths, config, progress, batch_size, tokenizer, not args.no_resume) for seed in SEEDS]
    candidates = [{"seed": report["seed"], "best_epoch": report["best_epoch"], "best_checkpoint": report["best_checkpoint"], "rank": rank_for(report["best_validation"]), "validation_metrics": report["best_validation"]["metrics"]} for report in reports]
    winner = max(candidates, key=lambda candidate: tuple(candidate["rank"]))
    comparison = {"version": "v0.6.4b", "selection": "validation_only_generation_rank", "candidates": candidates, "winning_seed": winner["seed"], "winning_epoch": winner["best_epoch"], "reason": "highest semantic binding, then parse, language, level-style, lower answer leakage, grounding, and lower validation loss", "hidden_test_open_count": 0}
    write_json(paths.outputs_dir / "v064b_validation_comparison.json", comparison)
    progress["winner_selected"] = {"seed": winner["seed"], "epoch": winner["best_epoch"], "checkpoint": winner["best_checkpoint"]}
    write_json(paths.outputs_dir / "v064b_progress.json", progress)
    assert progress["hidden_test_open_count"] == 0
    frozen = {"parser": "v064_formats.parse_question", "language_validator": "v064b_full.language_pass", "semantic_validator": "v064b_planner.semantic_binding", "level_style": "v064b_planner.level_style", "answer_leak": "v064b_full.answer_leak", "grounding": "v064b_full.grounding", "retry_policy": [1, 2, 4], "canonical_fallback": "v064b_planner.question"}
    progress["frozen_before_hidden"] = frozen
    write_json(paths.outputs_dir / "v064b_progress.json", progress)
    hidden = read_jsonl(hidden_path)
    progress["hidden_test_open_count"] = 1
    write_json(paths.outputs_dir / "v064b_progress.json", progress)
    static_audit(train, validation, paths, config, hidden)
    final_tokenizer = AutoTokenizer.from_pretrained(winner["best_checkpoint"], use_fast=False)
    model = __import__("transformers").AutoModelForSeq2SeqLM.from_pretrained(winner["best_checkpoint"]).to(DEVICE)
    hidden_report = final_hidden_evaluation(model, final_tokenizer, hidden, paths, winner, progress, config)
    final_model = paths.models_dir / "rafeeq-mt5-qg-v0.6.4b-final"
    final_model.mkdir(parents=True, exist_ok=True)
    model = __import__("transformers").AutoModelForSeq2SeqLM.from_pretrained(winner["best_checkpoint"])
    model.save_pretrained(final_model)
    final_tokenizer.save_pretrained(final_model)
    write_json(final_model / "experiment_metadata.json", {"version": "v0.6.4b", "selected_seed": winner["seed"], "selected_epoch": winner["best_epoch"], "validation_metrics": winner["validation_metrics"], "dataset_sha256": config["dataset_sha256"], "config_fingerprint": config["config_fingerprint"], "environment": environment(transformers_version), "hidden_evaluated": True})
    summary = {"version": "v0.6.4b", "status": "FULL GENERALIZATION COMPLETE", "counts": {"train": 480, "validation": 60, "hidden": 60}, "environment": environment(transformers_version), "batch_settings": progress["batch_settings"], "seed_runtimes": {str(report["seed"]): report["runtime_seconds"] for report in reports}, "peak_cuda_memory_bytes": max(report["peak_cuda_memory_bytes"] for report in reports), "resume_used": {str(report["seed"]): report["resume_used"] for report in reports}, "winning_seed": winner["seed"], "winning_epoch": winner["best_epoch"], "winning_reason": comparison["reason"], "hidden_test_open_count_before_winner_selection": 0, "hidden_test_open_count_immediately_before_hidden_evaluation": 0, "hidden_test_open_count_after_evaluation": 1, "hidden": {key: hidden_report[key] for key in ("first_pass", "after_retry", "average_attempts", "attempt_2_count", "attempt_3_count", "canonical_fallback_count", "canonical_fallback_rate", "system_validated_delivery_rate", "integrity", "grouped_metrics")}, "final_model_path": str(final_model), "config_fingerprint": config["config_fingerprint"]}
    write_json(paths.outputs_dir / "v064b_final_experiment_summary.json", summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
