from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from rafeeq_qg.v04_formats import parse_sentinel


def main() -> None:
    data = ROOT / "data" / "v05"
    rows = [json.loads(line) for line in (data / "master_v05.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    manifest = json.loads((data / "split_manifest_v05.json").read_text(encoding="utf-8"))
    checks = {
        "total_conditions": len(rows),
        "unique_conditions": len({row["input_condition"] for row in rows}),
        "curriculum_units": len({row["curriculum_unit_id"] for row in rows}),
        "concept_families": len({row["concept_family"] for row in rows}),
        "language_counts": dict(Counter(row["language"] for row in rows)),
        "subject_counts": dict(Counter(row["subject"] for row in rows)),
        "level_counts": {str(level): sum(row["level"] == level for row in rows) for level in (1, 2, 3)},
        "correct_letter_counts": dict(Counter(row["training_expected"]["correct_letter"] for row in rows)),
        "split_counts": dict(Counter(row["historical_split"] for row in rows)),
        "duplicate_input_count": len(rows) - len({row["input_condition"] for row in rows}),
        "duplicate_question_count": len(rows) - len({(row["language"], row["training_expected"]["question"]) for row in rows}),
        "duplicate_option_count": sum(len(set(row["training_expected"]["options"])) != 4 for row in rows),
        "empty_field_count": sum(not all(str(row.get(field, "")).strip() for field in ("id", "input_condition", "subject", "language", "concept_family")) for row in rows),
        "invalid_correct_option_count": sum(row["training_expected"]["correct_letter"] not in "ABCD" for row in rows),
        "sentinel_parse_failure_count": 0,
        "unit_leakage": False,
        "language_pair_leakage": False,
        "concept_family_leakage": False,
    }
    for row in rows:
        try:
            parse_sentinel(row["targets"]["sentinel_native_v2"])
        except ValueError:
            checks["sentinel_parse_failure_count"] += 1
    split_by_unit = {}
    for row in rows:
        split_by_unit.setdefault(row["curriculum_unit_id"], set()).add(row["historical_split"])
    checks["unit_leakage"] = any(len(splits) != 1 for splits in split_by_unit.values())
    checks["language_pair_leakage"] = any(len({row["historical_split"] for row in rows if row["curriculum_unit_id"] == unit}) != 1 for unit in split_by_unit)
    split_by_family = {}
    for row in rows:
        split_by_family.setdefault(row["concept_family"], set()).add(row["historical_split"])
    checks["concept_family_leakage"] = any(len(splits) != 1 for splits in split_by_family.values())
    critical = [name for name in ("duplicate_input_count", "duplicate_option_count", "empty_field_count", "invalid_correct_option_count", "sentinel_parse_failure_count") if checks[name]]
    checks["critical_failures"] = critical
    if critical or checks["unit_leakage"] or checks["language_pair_leakage"] or checks["concept_family_leakage"]:
        raise RuntimeError(json.dumps(checks, ensure_ascii=False))
    (data / "dataset_statistics_v05.json").write_text(json.dumps(checks, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(checks, ensure_ascii=False, indent=2))


if __name__ == "__main__": main()
