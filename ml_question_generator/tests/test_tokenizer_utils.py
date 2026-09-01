from pathlib import Path

from rafeeq_qg.curriculum_loader import load_curriculum
from rafeeq_qg.generator import CurriculumGroundedGenerator
from rafeeq_qg.tokenizer_utils import format_model_input, format_model_target


def test_training_prompt_has_explicit_task_level_source_and_bilingual_content():
    root = Path(__file__).resolve().parents[1]
    metadata, units = load_curriculum(root / "data" / "curriculum_demo.json")
    unit = units[0]
    condition = format_model_input(unit)
    assert "task=generate_mcq" in condition
    assert f"level={unit.level}" in condition
    assert f"subject={unit.subject}" in condition
    assert f"source_unit_id={unit.unit_id}" in condition
    assert unit.content_ar in condition
    assert unit.content_en in condition
    target = format_model_target(CurriculumGroundedGenerator(metadata["curriculum_id"]).from_unit(unit, 0))
    assert unit.prompt_ar in target
    assert unit.prompt_en in target
    assert '"correct_option"' in target
    assert '"source_unit_id"' in target
