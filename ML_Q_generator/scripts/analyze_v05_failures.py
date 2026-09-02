from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = Path(r"D:\RafeeqML")


def main() -> None:
    summary = json.loads((RUNTIME / "outputs" / "v05_final_experiment_summary.json").read_text(encoding="utf-8"))
    failures = [row for row in summary["final"]["test"]["results"] if row["failure_categories"] or not row["answer_consistent"]]
    taxonomy = Counter()
    by_dimension: dict[str, Counter] = defaultdict(Counter)
    for row in failures:
        categories = set(row["failure_categories"])
        if "duplicate_option" in categories: taxonomy["duplicate_options"] += 1
        if "answer_inconsistent" in categories: taxonomy["correct_letter_points_to_wrong_value"] += 1
        if "expected_answer_missing" in categories: taxonomy["correct_answer_not_among_options"] += 1
        if "sentinel_structure" in categories: taxonomy["malformed_sentinel_structure"] += 1
        if "wrong_language" in categories: taxonomy["wrong_language"] += 1
        if not categories: taxonomy["other"] += 1
        for dimension, value in (("subject", row["subject"]), ("level", str(row["level"])), ("language", row["language"])):
            for category in categories or {"other"}: by_dimension[f"{dimension}={value}"][category] += 1
    report = {"source": "historical v0.5 final test; not reused as v0.6 hidden test", "total_test_conditions": len(summary["final"]["test"]["results"]), "failure_count": len(failures), "overall_taxonomy": dict(taxonomy), "by_subject_level_language": {key: dict(value) for key, value in sorted(by_dimension.items())}, "known_v05_metrics": summary["final"]["test"]["metrics"], "limitations": ["The v0.5 evaluator did not label arithmetic semantics independently; wrong arithmetic is therefore represented by answer inconsistency where detected.", "No target-derived retry or repair was performed in v0.5."], "failed_examples": failures}
    path = RUNTIME / "outputs" / "v06_v05_failure_analysis.json"; path.parent.mkdir(parents=True, exist_ok=True); path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"failure_count": len(failures), "taxonomy": dict(taxonomy)}, indent=2))


if __name__ == "__main__": main()
