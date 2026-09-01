from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from rafeeq_qg.config import load_config
from rafeeq_qg.evaluation import evaluate_output, write_metrics
from rafeeq_qg.generator import LocalQuestionGenerator
from rafeeq_qg.runtime_paths import resolve_runtime_paths


def _read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def _merge(payloads: list[dict], mode: str) -> dict:
    return {
        "generation_mode": mode,
        "attempted_questions": sum(payload["attempted_questions"] for payload in payloads),
        "questions": [question for payload in payloads for question in payload["questions"]],
        "failures": [failure for payload in payloads for failure in payload["failures"]],
    }


def main() -> None:
    config = load_config(ROOT / "config.yaml")
    curriculum = ROOT / "data" / "curriculum_demo.json"
    paths = resolve_runtime_paths(ROOT)
    model_path = paths.models_dir / config.model_output_name
    output_dir = paths.outputs_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    if not model_path.exists():
        raise RuntimeError(f"MODEL MODE cannot run because trained model is missing: {model_path}")

    test_rows = _read_jsonl(ROOT / "data" / "test.jsonl")
    model = LocalQuestionGenerator(curriculum, model_path, config, mode="model")
    baseline = LocalQuestionGenerator(curriculum, config=config, mode="fallback")
    model_test_payloads = []
    baseline_test_payloads = []
    for level in (1, 2, 3):
        unit_ids = sorted({row["curriculum_unit_id"] for row in test_rows if row["level"] == level})
        for unit_id in unit_ids:
            attempts = sum(1 for row in test_rows if row["curriculum_unit_id"] == unit_id)
            # Each held-out record is a separate model attempt; no fallback is permitted here.
            model_test_payloads.append(model.generate(level, attempts, unit_id=unit_id))
            baseline_test_payloads.append(baseline.generate(level, attempts, unit_id=unit_id))
            inspection = model.generate(level, 5, unit_id=unit_id, sampling=True)
            (output_dir / f"model_level_{level}.json").write_text(
                json.dumps(inspection, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
            )

    model_metrics = evaluate_output(_merge(model_test_payloads, "model"), curriculum)
    baseline_metrics = evaluate_output(_merge(baseline_test_payloads, "fallback"), curriculum)
    write_metrics(model_metrics, output_dir / "model_evaluation_metrics.json")
    write_metrics(baseline_metrics, output_dir / "baseline_evaluation_metrics.json")
    print(json.dumps({"model": model_metrics, "baseline": baseline_metrics}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
