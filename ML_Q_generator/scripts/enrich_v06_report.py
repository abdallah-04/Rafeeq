from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

REPORT = Path(r"D:\RafeeqML\outputs\v06_final_experiment_summary.json")


def main() -> None:
    payload = json.loads(REPORT.read_text(encoding="utf-8"))
    final = payload["final"]
    results = final["test_results"]
    def group(field: str) -> dict:
        groups = defaultdict(list)
        for item in results:
            groups[str(item[field])].append(item)
        return {key: {"conditions": len(items), "raw_strict_parse": sum(i["strict_parse"] for i in items), "raw_language_pass": sum(i["language_pass"] for i in items), "hybrid_accepted": sum(i["hybrid_acceptance"]["accepted"] for i in items)} for key, items in sorted(groups.items())}
    final["hybrid_math_programmatic_count"] = sum(item["hybrid_acceptance"]["math_programmatic"] for item in results)
    final["breakdown"] = {field: group(field) for field in ("language", "subject", "level")}
    final["v05_failure_analysis_path"] = str(Path(r"D:\RafeeqML\outputs\v06_v05_failure_analysis.json"))
    REPORT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(REPORT), "breakdown_fields": list(final["breakdown"]), "hybrid_math_programmatic_count": final["hybrid_math_programmatic_count"]}, ensure_ascii=False))


if __name__ == "__main__": main()
