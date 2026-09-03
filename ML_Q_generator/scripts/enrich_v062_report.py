from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
DATA = ROOT / "data" / "v062" / "master_v062.jsonl"


def main() -> None:
    from rafeeq_qg.v062_hybrid import question_fact_binding
    report_path = Path(__import__("os").environ.get("RAFEEQ_ML_OUTPUTS_DIR", str(ROOT / "outputs"))) / "v062_final_experiment_summary.json"
    payload = json.loads(report_path.read_text(encoding="utf-8")); rows = {row["id"]: row for row in (json.loads(line) for line in DATA.read_text(encoding="utf-8").splitlines() if line.strip())}; results = payload["results"]
    def breakdown(field: str) -> dict:
        groups = defaultdict(list)
        for item in results: groups[str(rows[item["id"]][field])].append(item)
        return {key: {"conditions": len(items), "question_fact_binding": sum(item["final"]["integrity"]["question_fact_binding"] for item in items), "validated_acceptance": sum(all(item["final"]["integrity"].values()) for item in items)} for key, items in sorted(groups.items())}
    rejected = []
    for item in results:
        if not all(item["final"]["integrity"].values()):
            row = rows[item["id"]]; rejected.append({"id": item["id"], "input": row["input_condition"], "trusted_fact": row.get("fact_payload") or row["source_expected"], "raw_model_output": item["model"], "final": item["final"], "failure": "low_grounding_or_semantic_binding" if not item["final"]["integrity"]["question_fact_binding"] else "other"})
    payload["breakdowns"] = {field: breakdown(field) for field in ("language", "subject", "level", "task_type")}
    payload["arabic_vs_english_math"] = {language: breakdown_subset for language, breakdown_subset in ((language, {"conditions": sum(rows[item["id"]]["language"] == language and rows[item["id"]]["subject"] == "MATH" for item in results), "validated_acceptance": sum(rows[item["id"]]["language"] == language and rows[item["id"]]["subject"] == "MATH" and all(item["final"]["integrity"].values()) for item in results)}) for language in ("ar", "en"))}
    payload["semantic_rejected_examples"] = rejected; payload["representative_successes"] = [item for item in results if all(item["final"]["integrity"].values())][:6]; payload["failure_category_counts"] = dict(Counter(item["failure"] for item in rejected)); payload["comparison_note"] = "v0.6.2 uses a changed short Question+Explanation hybrid objective and must not be directly compared to historical full-MCQ raw parse rates."
    report_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"); (report_path.parent / "v062_final_hidden_test.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"); print(json.dumps({"report": str(report_path), "semantic_rejected": len(rejected), "breakdowns": list(payload["breakdowns"])}, ensure_ascii=False))


if __name__ == "__main__": main()
