from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

from .curriculum_loader import load_curriculum
from .schemas import CurriculumUnit
from .validator import validate_question

OPTION_FIELDS = tuple(f"option_{index}{suffix}" for index in range(1, 5) for suffix in ("", "_ar"))
TOKEN_PATTERN = re.compile(r"[A-Za-z0-9\u0600-\u06FF]+")


def lexical_grounding_heuristic(question: dict, unit: CurriculumUnit) -> dict:
    """Report lexical overlap only; this is not a semantic or educational-validity check."""
    source = " ".join((unit.topic_ar, unit.topic_en, unit.content_ar, unit.content_en))
    generated = " ".join(str(question.get(field, "")) for field in (
        "question_ar", "question_en", "explanation_ar", "explanation_en", *OPTION_FIELDS
    ))
    source_tokens = {token.casefold() for token in TOKEN_PATTERN.findall(source) if len(token) > 1}
    generated_tokens = {token.casefold() for token in TOKEN_PATTERN.findall(generated) if len(token) > 1}
    shared = sorted(source_tokens & generated_tokens)
    return {
        "lexical_grounding_heuristic_pass": bool(shared),
        "shared_tokens": shared[:20],
        "note": "Lexical overlap is a lightweight heuristic, not semantic correctness or educational validity.",
    }


def _has_exactly_four_options(question: dict) -> bool:
    return all(str(question.get(field, "")).strip() for field in OPTION_FIELDS)


def _evaluate_attempts(questions: list[dict], failures: list[dict], units_by_id: dict[str, CurriculumUnit]) -> dict:
    known_ids = set(units_by_id)
    seen: set[tuple[str, str]] = set()
    rows = []
    for question in questions:
        errors = validate_question(question, known_ids, seen)
        if not errors:
            seen.add((question["question_ar"], question["question_en"]))
        unit = units_by_id.get(question.get("source_unit_id"))
        lexical = lexical_grounding_heuristic(question, unit) if unit else {"lexical_grounding_heuristic_pass": False, "shared_tokens": []}
        rows.append((question, errors, lexical))
    total = len(questions) + len(failures)
    valid = sum(not errors for _, errors, _ in rows)
    duplicate = sum(any(error == "duplicate question" for error in errors) for _, errors, _ in rows)
    level_counts = Counter(question.get("target_level") for question, _, _ in rows)
    return {
        "total_attempted_questions": total,
        "valid_json_schema_rate": valid / total if total else 0.0,
        "bilingual_completeness_rate": sum(not any("missing or empty" in error for error in errors) for _, errors, _ in rows) / total if total else 0.0,
        "exactly_four_options_rate": sum(_has_exactly_four_options(question) for question, _, _ in rows) / total if total else 0.0,
        "valid_correct_option_rate": sum(not any("correct_option" in error for error in errors) for _, errors, _ in rows) / total if total else 0.0,
        "source_unit_grounding_rate": sum(question.get("source_unit_id") in known_ids for question, _, _ in rows) / total if total else 0.0,
        "lexical_grounding_heuristic_rate": sum(lexical["lexical_grounding_heuristic_pass"] for _, _, lexical in rows) / total if total else 0.0,
        "duplicate_question_rate": duplicate / total if total else 0.0,
        "generation_failures": len(failures),
        "valid_generated_questions_by_level": {str(level): level_counts[level] for level in (1, 2, 3)},
        "malformed_generation_details": [
            {"source_unit_id": question.get("source_unit_id"), "target_level": question.get("target_level"), "errors": errors}
            for question, errors, _ in rows if errors
        ],
        "failure_details": failures,
        "lexical_grounding_note": "Lexical grounding heuristic only; it does not establish semantic correctness or educational validity.",
    }


def evaluate_output(payload: dict, curriculum_path: str | Path) -> dict:
    metadata, units = load_curriculum(curriculum_path)
    units_by_id = {unit.unit_id: unit for unit in units}
    questions = payload.get("questions", [])
    failures = payload.get("failures", [])
    metrics = {
        "data_status": metadata["data_status"],
        "generation_mode": payload.get("generation_mode", "unknown"),
        "curriculum_id": metadata["curriculum_id"],
        **_evaluate_attempts(questions, failures, units_by_id),
    }
    metrics["per_level"] = {
        str(level): _evaluate_attempts(
            [question for question in questions if question.get("target_level") == level],
            [failure for failure in failures if failure.get("target_level") == level],
            units_by_id,
        )
        for level in (1, 2, 3)
    }
    return metrics


def write_metrics(metrics: dict, output_path: str | Path) -> None:
    Path(output_path).write_text(json.dumps(metrics, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
