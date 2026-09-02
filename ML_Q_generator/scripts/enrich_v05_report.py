from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = Path(r"D:\RafeeqML")


def metrics(rows: list[dict]) -> dict:
    total = len(rows)
    return {
        "conditions": total,
        "strict_parse_count": sum(row["strict_parse"] for row in rows),
        "answer_consistency_count": sum(row["answer_consistent"] for row in rows),
        "expected_answer_present_count": sum(row["expected_answer_present"] for row in rows),
        "language_pass_count": sum(row["language_pass"] for row in rows),
        "exact_field_matches": sum(row["exact_field_matches"] for row in rows),
        "exact_field_matches_out_of": total * 7,
        "mean_lexical_grounding_heuristic": sum(row["lexical_grounding_heuristic"] for row in rows) / total if total else 0.0,
        "failure_categories": {category: sum(category in row["failure_categories"] for row in rows) for category in ("duplicate_option", "answer_inconsistent", "expected_answer_missing", "wrong_language", "sentinel_structure", "malformed_output")},
    }


def main() -> None:
    data = ROOT / "data" / "v05" / "master_v05.jsonl"
    rows = [json.loads(line) for line in data.read_text(encoding="utf-8").splitlines() if line.strip()]
    report_path = RUNTIME / "outputs" / "v05_final_experiment_summary.json"
    report = json.loads(report_path.read_text(encoding="utf-8"))
    test_results = report["final"]["test"]["results"]
    by_id = {row["id"]: row for row in rows}
    groups = {}
    for key, predicate in {
        "language": lambda row, value: row["language"] == value,
        "subject": lambda row, value: row["subject"] == value,
        "level": lambda row, value: row["level"] == int(value),
        "language_subject": lambda row, value: row["language"] == value[0] and row["subject"] == value[1],
    }.items():
        groups[key] = {}
        values = ("ar", "en") if key == "language" else ("MATH", "LANGUAGE") if key == "subject" else ("1", "2", "3") if key == "level" else ("ar-MATH", "ar-LANGUAGE", "en-MATH", "en-LANGUAGE")
        for value in values:
            selected = [result for result in test_results if predicate(by_id[result["id"]], value.split("-") if key == "language_subject" else value)]
            groups[key][value] = metrics(selected)
    math_results = [result for result in test_results if by_id[result["id"]]["subject"] == "MATH"]
    report["dataset_audit"] = json.loads((ROOT / "data" / "v05" / "dataset_statistics_v05.json").read_text(encoding="utf-8"))
    report["test_breakdown"] = groups
    report["math_programmatic_verification"] = {"programmatically_verifiable_count": len(math_results), "correctness_count": sum(result["answer_consistent"] for result in math_results), "note": "For these generated arithmetic templates, answer consistency is a deterministic check against the stored source fact; this is not an LLM judgment."}
    report["generalization_assessment"] = "MODERATE" if report["final"]["test"]["metrics"]["answer_consistency_count"] >= 36 else "LIMITED"
    report["recommendation"] = "YES, continue mT5 with further data and objective-quality work; this remains an offline university proof-of-concept."
    report["v04_historical_comparison"] = {"v04_status": "historical benchmark already observed", "v04_unique_conditions": 72, "v04_train_validation_test_rows": [60, 6, 6], "v05_unique_conditions": 480, "v05_train_validation_test_rows": [360, 60, 60], "definitions_note": "v0.4 and v0.5 are separate datasets and test memberships; do not treat their metrics as identical experiments."}
    report["representative_test_samples"] = [result for result in test_results if result["language"] in {"ar", "en"}][:12]
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"breakdown": groups, "math": report["math_programmatic_verification"], "assessment": report["generalization_assessment"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__": main()
