from pathlib import Path

import pytest

from rafeeq_qg.generator import LocalQuestionGenerator


def test_model_mode_cannot_silently_use_fallback_without_local_weights():
    root = Path(__file__).resolve().parents[1]
    with pytest.raises(RuntimeError, match="MODEL MODE"):
        LocalQuestionGenerator(
            root / "data" / "curriculum_demo.json",
            root / "models" / "missing-model",
            mode="model",
        )
