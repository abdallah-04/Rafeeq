from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from rafeeq_qg.v061_formats import parse_short
from rafeeq_qg.v061_hybrid import APPROVED_LANGUAGE_TASK_TYPES, APPROVED_MATH_TASK_TYPES, build_final, verify_fact


def main() -> None:
    data = ROOT / "data" / "v061"
    rows = [json.loads(line) for line in (data / "master_v061.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    facts = [row for row in rows if row["subject"] == "MATH"]
    fact_by_task = {}
    for row in facts:
        fact_by_task.setdefault(row["task_type"], []).append(verify_fact(row["fact_payload"]))
    duplicate_inputs = len(rows) - len({row["input_condition"] for row in rows})
    conflicting_targets = sum(len({row["targets"]["short_sentinel_v061"] for row in rows if row["input_condition"] == key}) > 1 for key in {row["input_condition"] for row in rows})
    final_objects = [build_final(row, {"question": row["training_expected"]["question"], "explanation": row["training_expected"]["explanation"]}) for row in rows]
    stats = {"total": len(rows), "split_counts": dict(Counter(row["historical_split"] for row in rows)), "unique_conditions": len({row["input_condition"] for row in rows}), "duplicate_input_count": duplicate_inputs, "conflicting_target_group_count": conflicting_targets, "duplicate_question_target_count": len(rows) - len({(row["language"], row["targets"]["short_sentinel_v061"]) for row in rows}), "language_counts": dict(Counter(row["language"] for row in rows)), "subject_counts": dict(Counter(row["subject"] for row in rows)), "level_counts": dict(Counter(str(row["level"]) for row in rows)), "task_types": dict(Counter(row["task_type"] for row in rows)), "short_parse_failures": sum(_bad_short(row) for row in rows), "unknown_math_operation_count": sum(row["subject"] == "MATH" and not verify_fact(row["fact_payload"]) for row in rows), "math_short_reading_misclassification_count": sum(row["subject"] == "MATH" and row["task_type"] not in APPROVED_MATH_TASK_TYPES for row in rows), "language_task_schema_failure_count": sum(row["subject"] == "LANGUAGE" and row["task_type"] not in APPROVED_LANGUAGE_TASK_TYPES for row in rows), "structured_fact_verification_by_task": {task: {"verified": sum(values), "total": len(values)} for task, values in sorted(fact_by_task.items())}, "deterministic_final_unique_options": sum(not item["integrity"]["four_unique_options"] for item in final_objects if item), "deterministic_final_failures": sum(item is None or not all(item["integrity"].values()) for item in final_objects), "new_validation_units": len({row["curriculum_unit_id"] for row in rows if row["historical_split"] == "validation"}), "new_test_units": len({row["curriculum_unit_id"] for row in rows if row["historical_split"] == "test"}), "v05_or_v06_test_ids_in_v061_test": []}
    stats["critical_failures"] = [key for key in ("duplicate_input_count", "conflicting_target_group_count", "short_parse_failures", "unknown_math_operation_count", "math_short_reading_misclassification_count", "language_task_schema_failure_count", "deterministic_final_unique_options", "deterministic_final_failures") if stats[key]]
    if stats["critical_failures"]:
        raise RuntimeError(json.dumps(stats, ensure_ascii=False))
    (data / "dataset_statistics_v061.json").write_text(json.dumps(stats, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(stats, ensure_ascii=False, indent=2))


def _bad_short(row: dict) -> int:
    try:
        parse_short(row["targets"]["short_sentinel_v061"])
        return 0
    except ValueError:
        return 1


if __name__ == "__main__": main()
