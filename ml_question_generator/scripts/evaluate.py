from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from rafeeq_qg.evaluation import evaluate_output, write_metrics


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate a local Rafeeq prototype generation output.")
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", type=Path, default=ROOT / "outputs" / "evaluation_metrics.json")
    args = parser.parse_args()
    payload = json.loads(args.input.read_text(encoding="utf-8"))
    metrics = evaluate_output(payload, ROOT / "data" / "curriculum_demo.json")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    write_metrics(metrics, args.output)
    print(json.dumps(metrics, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
