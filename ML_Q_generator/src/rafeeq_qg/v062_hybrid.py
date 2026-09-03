from __future__ import annotations

import hashlib
import re

from .v061_hybrid import verify_fact


def stable_position(row_id: str) -> int:
    return int(hashlib.sha256(row_id.encode("utf-8")).hexdigest()[:8], 16) % 4


def deterministic_options(row: dict) -> tuple[list[str], str]:
    expected = str(row["source_expected"]["answer"])
    values = [str(value) for value in row["source_expected"].get("distractors", [])]
    unique = []
    for value in values:
        if value.casefold() != expected.casefold() and value.casefold() not in {item.casefold() for item in unique}:
            unique.append(value)
    if len(unique) != 3:
        raise ValueError("trusted distractor pool must contain exactly three unique distractors")
    position = stable_position(row["id"])
    options = unique[:]
    options.insert(position, expected)
    return options, "ABCD"[position]


def language_pass(text: str, language: str) -> bool:
    arabic = len(re.findall(r"[\u0600-\u06FF]+", text))
    latin = len(re.findall(r"[A-Za-z]+", text))
    return arabic >= 2 and arabic >= latin if language == "ar" else latin >= 2 and arabic == 0


def question_fact_binding(row: dict, question: str) -> bool:
    fact = row.get("fact_payload") or {}
    numbers = [str(value) for value in fact.get("sequence", [])]
    for key in ("operand_1", "operand_2", "known", "total", "left", "right"):
        if key in fact: numbers.append(str(fact[key]))
    if row["subject"] == "MATH" and row["task_type"] in {"ADDITION", "SUBTRACTION", "MISSING_NUMBER", "SEQUENCE", "COMPARISON"}:
        return sum(number in question for number in numbers) >= 2
    return bool(question.strip()) and any(token.casefold() in question.casefold() for token in re.findall(r"[\w\u0600-\u06FF]+", row["content"]) if len(token) > 2)


def build_final(row: dict, model_output: dict) -> dict:
    if row["subject"] == "MATH" and not verify_fact(row["fact_payload"]):
        raise ValueError("unsupported or invalid curriculum fact")
    options, letter = deterministic_options(row)
    correct = str(row["source_expected"]["answer"])
    return {"question": model_output["question"], "options": options, "correct_letter": letter, "explanation": model_output["explanation"], "provenance": {"question_source": "MODEL", "explanation_source": "MODEL", "correct_answer_source": "CURRICULUM_FACT", "options_source": "DETERMINISTIC_CURRICULUM_ENGINE", "correct_letter_source": "DETERMINISTIC_POSITIONING", "trusted_answer_given_to_model": True}, "integrity": {"unique_options": len({value.casefold() for value in options}) == 4, "answer_once": sum(value.casefold() == correct.casefold() for value in options) == 1, "letter_consistent": options[ord(letter) - 65] == correct, "question_fact_binding": question_fact_binding(row, model_output["question"])}}
