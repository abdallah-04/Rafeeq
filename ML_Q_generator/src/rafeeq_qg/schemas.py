from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

VALID_LEVELS = {1, 2, 3}
VALID_SUBJECTS = {"MATH", "LANGUAGE"}


@dataclass(frozen=True)
class CurriculumUnit:
    curriculum_id: str
    unit_id: str
    subject: str
    level: int
    skill_domain: str
    topic_ar: str
    topic_en: str
    learning_objective_ar: str
    learning_objective_en: str
    content_ar: str
    content_en: str
    keywords_ar: list[str]
    keywords_en: list[str]
    prompt_ar: str
    prompt_en: str
    answer_ar: str
    answer_en: str
    distractors_ar: list[str]
    distractors_en: list[str]

    @classmethod
    def from_dict(cls, raw: dict[str, Any]) -> "CurriculumUnit":
        required = {
            "curriculum_id", "unit_id", "subject", "level", "skill_domain", "topic_ar",
            "topic_en", "learning_objective_ar", "learning_objective_en", "content_ar",
            "content_en", "keywords_ar", "keywords_en", "prompt_ar", "prompt_en", "answer_ar",
            "answer_en", "distractors_ar", "distractors_en",
        }
        missing = required.difference(raw)
        if missing:
            raise ValueError(f"Curriculum unit is missing fields: {sorted(missing)}")
        unit = cls(**{key: raw[key] for key in required})
        if unit.level not in VALID_LEVELS:
            raise ValueError(f"Unsupported level: {unit.level}")
        if unit.subject not in VALID_SUBJECTS:
            raise ValueError(f"Unsupported subject: {unit.subject}")
        if len(unit.distractors_ar) != 3 or len(unit.distractors_en) != 3:
            raise ValueError(f"{unit.unit_id} must provide three bilingual distractors")
        return unit


@dataclass(frozen=True)
class GeneratedQuestion:
    source_unit_id: str
    subject: str
    topic_ar: str
    topic_en: str
    question_ar: str
    question_en: str
    option_1_ar: str
    option_1: str
    option_2_ar: str
    option_2: str
    option_3_ar: str
    option_3: str
    option_4_ar: str
    option_4: str
    correct_option: int
    explanation_ar: str
    explanation_en: str
    target_level: int

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)
