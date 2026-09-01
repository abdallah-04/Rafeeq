from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from rafeeq_qg.config import load_config
from rafeeq_qg.evaluation import evaluate_output, write_metrics
from rafeeq_qg.generator import LocalQuestionGenerator


def main() -> None:
    curriculum = ROOT / "data" / "curriculum_demo.json"
    output_dir = ROOT / "outputs"
    output_dir.mkdir(parents=True, exist_ok=True)
    generator = LocalQuestionGenerator(curriculum, config=load_config(ROOT / "config.yaml"), mode="fallback")
    all_questions = []
    for level in (1, 2, 3):
        payload = generator.generate(level=level, num_questions=4)
        destination = output_dir / f"demo_level_{level}.json"
        destination.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        all_questions.extend(payload["questions"])
        print(f"Level {level}: {len(payload['questions'])} questions -> {destination.name}")
    metrics = evaluate_output({"questions": all_questions}, curriculum)
    write_metrics(metrics, output_dir / "baseline_evaluation_metrics.json")
    print("Wrote baseline-only evaluation metrics.")


if __name__ == "__main__":
    main()
