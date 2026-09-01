from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from rafeeq_qg.compact_format import parse_compact_target
from rafeeq_qg.compact_model import CompactModelGenerator, lexical_grounding_heuristic
from rafeeq_qg.config import load_config
from rafeeq_qg.curriculum_loader import load_curriculum
from rafeeq_qg.runtime_paths import resolve_runtime_paths


def _rows(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def _metrics(results: list[dict], units: dict[str, object]) -> dict:
    valid = [result for result in results if result["validation_result"] == "valid"]
    return {
        "attempted_generations": len(results),
        "successful_parses": len(valid),
        "parser_success_rate": len(valid) / len(results) if results else 0.0,
        "complete_field_rate": len(valid) / len(results) if results else 0.0,
        "four_option_rate": sum(len(result["parsed_output"]["options"]) == 4 for result in valid) / len(results) if results else 0.0,
        "correct_answer_field_rate": sum(result["parsed_output"]["correct_option"] in {1, 2, 3, 4} for result in valid) / len(results) if results else 0.0,
        "duplicate_option_rate": sum(len(set(option.casefold() for option in result["parsed_output"]["options"])) != 4 for result in valid) / len(results) if results else 0.0,
        "lexical_grounding_heuristic_rate": sum(lexical_grounding_heuristic(result["parsed_output"], units[result["parsed_output"]["source_unit_id"]], result["parsed_output"]["language"]) for result in valid) / len(results) if results else 0.0,
        "malformed_generation_count": len(results) - len(valid),
        "failures": [result for result in results if result["validation_result"] != "valid"],
    }


def main() -> None:
    config = load_config(ROOT / "config.yaml")
    paths = resolve_runtime_paths(ROOT)
    paths.outputs_dir.mkdir(parents=True, exist_ok=True)
    metadata, units = load_curriculum(ROOT / "data" / "curriculum_demo.json")
    units_by_id = {unit.unit_id: unit for unit in units}
    rows = _rows(ROOT / "data" / "test.jsonl")
    model = CompactModelGenerator(ROOT / "data" / "curriculum_demo.json", paths.models_dir / config.model_output_name, config)
    grouped: dict[tuple[int, str], list[dict]] = defaultdict(list)
    baseline_grouped: dict[tuple[int, str], list[dict]] = defaultdict(list)
    for row in rows:
        unit = units_by_id[row["curriculum_unit_id"]]
        result = model.generate(unit, row["language"])
        grouped[(row["level"], row["language"])].append(result)
        baseline = {"input_context": row["input"]["condition"], "raw_model_output": row["target"]}
        try:
            parsed = parse_compact_target(row["target"])
            baseline.update({"parsed_output": CompactModelGenerator._attach_metadata(parsed, unit, row["language"]), "validation_result": "valid"})
        except ValueError as exc:
            baseline.update({"parsed_output": None, "validation_result": "invalid", "failure_reason": str(exc)})
        baseline_grouped[(row["level"], row["language"])].append(baseline)
    model_metrics = {f"level_{level}_{language}": _metrics(results, units_by_id) for (level, language), results in grouped.items()}
    baseline_metrics = {f"level_{level}_{language}": _metrics(results, units_by_id) for (level, language), results in baseline_grouped.items()}
    (paths.outputs_dir / "model_v02_evaluation_metrics.json").write_text(json.dumps(model_metrics, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (paths.outputs_dir / "baseline_v02_evaluation_metrics.json").write_text(json.dumps(baseline_metrics, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for (level, language), results in grouped.items():
        (paths.outputs_dir / f"model_v02_level_{level}_{language}.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(model_metrics, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
