from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from rafeeq_qg.diagnostics import audit_registered_structural_tokens, audit_split_files, audit_structural_tokens


def main() -> None:
    split_report = audit_split_files(ROOT / "data" / "train.jsonl", ROOT / "data" / "validation.jsonl", ROOT / "data" / "test.jsonl")
    tokenizer_report = audit_structural_tokens()
    registered_tokenizer_report = audit_registered_structural_tokens()
    report = {
        "dataset": split_report,
        "tokenizer": tokenizer_report,
        "tokenizer_after_registration": registered_tokenizer_report,
    }
    output_path = ROOT / "outputs" / "audit_report.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
