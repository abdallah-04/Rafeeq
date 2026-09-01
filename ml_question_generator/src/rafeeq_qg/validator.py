from __future__ import annotations

from .schemas import GeneratedQuestion, VALID_LEVELS

REQUIRED_TEXT_FIELDS = (
    "source_unit_id", "subject", "topic_ar", "topic_en", "question_ar", "question_en",
    "option_1_ar", "option_1", "option_2_ar", "option_2", "option_3_ar", "option_3",
    "option_4_ar", "option_4", "explanation_ar", "explanation_en",
)


def validate_question(question: GeneratedQuestion | dict, known_unit_ids: set[str], seen_questions: set[tuple[str, str]] | None = None) -> list[str]:
    raw = question.as_dict() if isinstance(question, GeneratedQuestion) else question
    errors = [f"missing or empty {field}" for field in REQUIRED_TEXT_FIELDS if not str(raw.get(field, "")).strip()]
    if raw.get("target_level") not in VALID_LEVELS:
        errors.append("target_level must be 1, 2, or 3")
    if raw.get("correct_option") not in {1, 2, 3, 4}:
        errors.append("correct_option must be 1..4")
    if raw.get("source_unit_id") not in known_unit_ids:
        errors.append("source_unit_id is not in the supplied curriculum")
    en_options = [str(raw.get(f"option_{index}", "")).strip().casefold() for index in range(1, 5)]
    ar_options = [str(raw.get(f"option_{index}_ar", "")).strip() for index in range(1, 5)]
    if len(set(en_options)) != 4 or not all(en_options):
        errors.append("English options must contain four unique values")
    if len(set(ar_options)) != 4 or not all(ar_options):
        errors.append("Arabic options must contain four unique values")
    fingerprint = (str(raw.get("question_ar", "")).strip(), str(raw.get("question_en", "")).strip())
    if seen_questions is not None and fingerprint in seen_questions:
        errors.append("duplicate question")
    return errors


def assert_valid(question: GeneratedQuestion | dict, known_unit_ids: set[str], seen_questions: set[tuple[str, str]] | None = None) -> None:
    errors = validate_question(question, known_unit_ids, seen_questions)
    if errors:
        raise ValueError("; ".join(errors))
