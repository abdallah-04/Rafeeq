from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from rafeeq_qg.hybrid import verify_math_fact
from rafeeq_qg.v04_formats import parse_sentinel


def main() -> None:
    data = ROOT / "data" / "v06"; rows = [json.loads(line) for line in (data / "master_v06.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    units = {row["curriculum_unit_id"] for row in rows}; families = {row["concept_family"] for row in rows}; templates = {row["template_family"] for row in rows}
    math_rows = [row for row in rows if row["subject"] == "MATH"]
    stats = {"total_conditions": len(rows), "unique_conditions": len({row["input_condition"] for row in rows}), "curriculum_units": len(units), "concept_families": len(families), "template_families": len(templates), "task_types": dict(Counter(row["task_type"] for row in rows)), "language_counts": dict(Counter(row["language"] for row in rows)), "subject_counts": dict(Counter(row["subject"] for row in rows)), "level_counts": dict(Counter(str(row["level"]) for row in rows)), "correct_letter_counts": dict(Counter(row["training_expected"]["correct_letter"] for row in rows)), "split_counts": dict(Counter(row["historical_split"] for row in rows)), "duplicate_input_count": len(rows) - len({row["input_condition"] for row in rows}), "duplicate_question_count": len(rows) - len({(row["language"], row["training_expected"]["question"]) for row in rows}), "duplicate_option_count": sum(len(set(row["training_expected"]["options"])) != 4 for row in rows), "sentinel_parse_failure_count": sum(_sentinel_bad(row) for row in rows), "structured_math_fact_count": len(math_rows), "structured_math_fact_verified_count": sum(verify_math_fact(row["fact_payload"]) for row in math_rows), "unit_leakage": _leak(rows, "curriculum_unit_id"), "language_pair_leakage": _pair_leak(rows), "concept_family_leakage": _leak(rows, "concept_family"), "template_family_leakage": _leak(rows, "template_family")}
    stats["critical_failures"] = [key for key in ("duplicate_input_count", "duplicate_option_count", "sentinel_parse_failure_count", "unit_leakage", "language_pair_leakage", "concept_family_leakage", "template_family_leakage") if stats[key]]
    if stats["structured_math_fact_verified_count"] != stats["structured_math_fact_count"]: stats["critical_failures"].append("structured_math_fact_verification")
    if stats["critical_failures"]: raise RuntimeError(json.dumps(stats, ensure_ascii=False))
    (data / "dataset_statistics_v06.json").write_text(json.dumps(stats, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"); print(json.dumps(stats, ensure_ascii=False, indent=2))


def _sentinel_bad(row: dict) -> int:
    try: parse_sentinel(row["targets"]["sentinel_native_v2"]); return 0
    except ValueError: return 1


def _leak(rows: list[dict], field: str) -> bool:
    groups = {}
    for row in rows: groups.setdefault(row[field], set()).add(row["historical_split"])
    return any(len(value) > 1 for value in groups.values())


def _pair_leak(rows: list[dict]) -> bool:
    return _leak(rows, "curriculum_unit_id")


if __name__ == "__main__": main()
