from pathlib import Path

import pytest

from rafeeq_qg.curriculum_loader import load_curriculum, select_units
from rafeeq_qg.generator import LocalQuestionGenerator


def test_rejects_invalid_level():
    root = Path(__file__).resolve().parents[1]
    _, units = load_curriculum(root / "data" / "curriculum_demo.json")
    with pytest.raises(ValueError, match="target level"):
        select_units(units, 4)


def test_rejects_question_count_outside_required_range():
    root = Path(__file__).resolve().parents[1]
    generator = LocalQuestionGenerator(root / "data" / "curriculum_demo.json")
    with pytest.raises(ValueError, match="num_questions"):
        generator.generate(level=1, num_questions=2)
