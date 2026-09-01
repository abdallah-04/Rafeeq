from pathlib import Path

from rafeeq_qg.curriculum_loader import load_curriculum
from rafeeq_qg.tokenizer_utils import format_model_input


def test_training_prompt_has_explicit_language_level_subject_and_context():
    root = Path(__file__).resolve().parents[1]
    _, units = load_curriculum(root / "data" / "curriculum_demo.json")
    unit = units[0]
    for condition, language, topic, content in (
        (format_model_input(unit, "ar"), "ar", unit.topic_ar, unit.content_ar),
        (format_model_input(unit, "en"), "en", unit.topic_en, unit.content_en),
    ):
        assert "task=generate_mcq" in condition
        assert f"language={language}" in condition
        assert f"level={unit.level}" in condition
        assert f"subject={unit.subject}" in condition
        assert f"topic={topic}" in condition
        assert f"content={content}" in condition
        assert "source_unit_id" not in condition
