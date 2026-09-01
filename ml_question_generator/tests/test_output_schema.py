from pathlib import Path

from rafeeq_qg.generator import LocalQuestionGenerator
from rafeeq_qg.validator import validate_question


def test_generated_questions_are_bilingual_valid_and_unique():
    root = Path(__file__).resolve().parents[1]
    generator = LocalQuestionGenerator(root / "data" / "curriculum_demo.json")
    payload = generator.generate(level=2, num_questions=4)
    known_ids = {unit.unit_id for unit in generator.units}
    seen = set()
    assert len(payload["questions"]) == 4
    for question in payload["questions"]:
        assert question["target_level"] == 2
        assert not validate_question(question, known_ids, seen)
        seen.add((question["question_ar"], question["question_en"]))
