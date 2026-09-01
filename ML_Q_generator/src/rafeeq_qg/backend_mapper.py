from __future__ import annotations

from .schemas import GeneratedQuestion

QUIZ_QUESTION_FIELDS = (
    "question_ar", "question_en", "option_1_ar", "option_1", "option_2_ar", "option_2",
    "option_3_ar", "option_3", "option_4_ar", "option_4", "correct_option",
    "explanation_ar", "explanation_en",
)


def to_backend_compatible(question: GeneratedQuestion | dict) -> dict:
    source = question.as_dict() if isinstance(question, GeneratedQuestion) else question
    return {field: source[field] for field in QUIZ_QUESTION_FIELDS}
