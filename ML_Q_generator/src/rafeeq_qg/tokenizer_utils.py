from __future__ import annotations

from .schemas import CurriculumUnit


def format_model_input(unit: CurriculumUnit, language: str) -> str:
    if language not in {"ar", "en"}:
        raise ValueError("language must be ar or en")
    topic = unit.topic_ar if language == "ar" else unit.topic_en
    content = unit.content_ar if language == "ar" else unit.content_en
    return "\n".join([
        "task=generate_mcq",
        f"language={language}",
        f"level={unit.level}",
        f"subject={unit.subject}",
        f"topic={topic}",
        f"content={content}",
    ])
