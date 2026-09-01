from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from rafeeq_qg.config import load_config
from rafeeq_qg.generator import LocalQuestionGenerator


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate curriculum-grounded Rafeeq prototype questions locally.")
    parser.add_argument("--level", required=True, type=int, choices=(1, 2, 3))
    parser.add_argument("--num-questions", required=True, type=int)
    parser.add_argument("--subject", choices=("MATH", "LANGUAGE"))
    parser.add_argument("--unit-id")
    parser.add_argument("--model-path", type=Path, help="Optional local trained model directory. No remote model is loaded.")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    generator = LocalQuestionGenerator(
        ROOT / "data" / "curriculum_demo.json", args.model_path, load_config(ROOT / "config.yaml")
    )
    payload = generator.generate(args.level, args.num_questions, args.subject, args.unit_id)
    output = args.output or ROOT / "outputs" / f"generate_level_{args.level}.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(payload['questions'])} question(s) to {output}")


if __name__ == "__main__":
    main()
