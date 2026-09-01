from pathlib import Path

from rafeeq_qg.backend_mapper import QUIZ_QUESTION_FIELDS, to_backend_compatible
from rafeeq_qg.generator import LocalQuestionGenerator


def test_mapper_uses_existing_quiz_field_conventions_only():
    root = Path(__file__).resolve().parents[1]
    generator = LocalQuestionGenerator(root / "data" / "curriculum_demo.json")
    question = generator.generate(level=1, num_questions=3)["questions"][0]
    mapped = to_backend_compatible(question)
    assert tuple(mapped) == QUIZ_QUESTION_FIELDS
    assert mapped["correct_option"] in {1, 2, 3, 4}
    assert "source_unit_id" not in mapped
