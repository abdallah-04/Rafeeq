from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]; sys.path.insert(0, str(ROOT / "src"))
from rafeeq_qg.v061_formats import parse_short
from rafeeq_qg.v061_hybrid import APPROVED_LANGUAGE_TASK_TYPES, APPROVED_MATH_TASK_TYPES, verify_fact
from rafeeq_qg.v062_hybrid import deterministic_options


def norm(value: str) -> str:
    return re.sub(r"[^\w\u0600-\u06FF]+", " ", value).casefold().strip()


def main() -> None:
    path = ROOT / "data" / "v062" / "master_v062.jsonl"; rows = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    splits = {split: [row for row in rows if row["split"] == split] for split in ("train", "validation", "test")}; val, test = splits["validation"], splits["test"]
    task_counts = Counter(row["task_type"] for row in rows); fact_counts = defaultdict(lambda: [0, 0])
    for row in rows:
        if row["subject"] == "MATH": fact_counts[row["task_type"]][1] += 1; fact_counts[row["task_type"]][0] += int(verify_fact(row["fact_payload"]))
    final = [deterministic_options(row) for row in rows]
    val_test_sig = {row["instance_signature"] for row in val} & {row["instance_signature"] for row in test}
    val_test_questions = {norm(row["source_expected"]["question"]) for row in val} & {norm(row["source_expected"]["question"]) for row in test}
    val_test_content = {norm(row["content"]) for row in val} & {norm(row["content"]) for row in test}
    val_test_facts = {(row["task_type"], json.dumps(row["fact_payload"], sort_keys=True, ensure_ascii=False)) for row in val if row["subject"] == "MATH"} & {(row["task_type"], json.dumps(row["fact_payload"], sort_keys=True, ensure_ascii=False)) for row in test if row["subject"] == "MATH"}
    val_test_units = {row["curriculum_unit_id"] for row in val} & {row["curriculum_unit_id"] for row in test}
    stats = {"total": len(rows), "split_counts": {key: len(value) for key, value in splits.items()}, "unique_inputs": len({row["input_condition"] for row in rows}), "language_counts": dict(Counter(row["language"] for row in rows)), "subject_counts": dict(Counter(row["subject"] for row in rows)), "level_counts": dict(Counter(str(row["level"]) for row in rows)), "task_types": dict(task_counts), "short_parse_failures": sum(_parse_bad(row) for row in rows), "unknown_math_operation_count": sum(row["subject"] == "MATH" and not verify_fact(row["fact_payload"]) for row in rows), "math_language_misclassification_count": sum(row["subject"] == "MATH" and row["task_type"] not in APPROVED_MATH_TASK_TYPES for row in rows), "language_schema_failure_count": sum(row["subject"] == "LANGUAGE" and row["task_type"] not in APPROVED_LANGUAGE_TASK_TYPES for row in rows), "structured_fact_by_task": {key: {"verified": value[0], "total": value[1]} for key, value in sorted(fact_counts.items())}, "deterministic_option_failures": sum(len(set(options)) != 4 or options[ord(letter)-65] != str(row["source_expected"]["answer"]) for row, (options, letter) in zip(rows, final)), "validation_test_unit_intersection": len(val_test_units), "validation_test_signature_intersection": len(val_test_sig), "validation_test_normalized_question_intersection": len(val_test_questions), "validation_test_normalized_content_intersection": len(val_test_content), "validation_test_structured_fact_intersection": len(val_test_facts), "validation_test_language_signature_intersection": len({row["instance_signature"] for row in val if row["subject"] == "LANGUAGE"} & {row["instance_signature"] for row in test if row["subject"] == "LANGUAGE"}), "split_name_in_semantic_ids": sum(any(token in row[field].casefold() for token in ("train", "validation", "test")) for row in rows for field in ("skill_family", "template_family", "instance_signature")), "new_split_duplicate_question_count": len(val + test) - len({(row["language"], row["split"], norm(row["source_expected"]["question"])) for row in val + test})}
    stats["critical_failures"] = [key for key in ("short_parse_failures", "unknown_math_operation_count", "math_language_misclassification_count", "language_schema_failure_count", "deterministic_option_failures", "validation_test_unit_intersection", "validation_test_signature_intersection", "validation_test_normalized_question_intersection", "validation_test_normalized_content_intersection", "validation_test_structured_fact_intersection", "validation_test_language_signature_intersection", "split_name_in_semantic_ids") if stats[key]]
    if stats["total"] != 600 or stats["split_counts"] != {"train": 480, "validation": 60, "test": 60} or stats["unique_inputs"] != 600: stats["critical_failures"].append("shape_or_uniqueness")
    if stats["critical_failures"]: raise RuntimeError(json.dumps(stats, ensure_ascii=False))
    (ROOT / "data" / "v062" / "dataset_statistics_v062.json").write_text(json.dumps(stats, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"); print(json.dumps(stats, ensure_ascii=False, indent=2))


def _parse_bad(row: dict) -> int:
    try: parse_short(row["targets"]["short_sentinel_v062"]); return 0
    except ValueError: return 1


if __name__ == "__main__": main()
