from __future__ import annotations

import hashlib
import re
from collections.abc import Callable

from .v061_formats import parse_short

APPROVED_MATH_TASK_TYPES = {"ADDITION", "SUBTRACTION", "MISSING_NUMBER", "SEQUENCE", "COMPARISON", "NUMBER_RECOGNITION", "COUNTING", "SHAPE_RECOGNITION"}
APPROVED_LANGUAGE_TASK_TYPES = {"LETTER_RECOGNITION", "WORD_RECOGNITION", "ACTION_WORD", "WORD_MEANING", "SHORT_READING", "CONTEXT_SELECTION", "BASIC_INFERENCE"}
_ARABIC_TOKEN_RE = re.compile(r"[\u0600-\u06FF]+")
_LATIN_TOKEN_RE = re.compile(r"[A-Za-z]+")


def verify_fact(fact: dict) -> bool:
    task_type = fact.get("task_type")
    operation = fact.get("operation")
    if task_type == "ADDITION" and operation == "add":
        return _ints(fact, "operand_1", "operand_2", "answer") and fact["operand_1"] + fact["operand_2"] == fact["answer"]
    if task_type == "SUBTRACTION" and operation == "subtract":
        return _ints(fact, "operand_1", "operand_2", "answer") and fact["operand_1"] - fact["operand_2"] == fact["answer"]
    if task_type == "MISSING_NUMBER" and operation == "missing_add":
        return _ints(fact, "known", "total", "answer") and fact["known"] + fact["answer"] == fact["total"]
    if task_type == "SEQUENCE" and operation == "arithmetic_sequence":
        sequence, difference, answer = fact.get("sequence"), fact.get("difference"), fact.get("answer")
        return isinstance(sequence, list) and len(sequence) >= 2 and all(isinstance(v, int) for v in sequence) and isinstance(difference, int) and isinstance(answer, int) and all(sequence[i] - sequence[i - 1] == difference for i in range(1, len(sequence))) and answer == sequence[-1] + difference
    if task_type == "COMPARISON" and operation == "compare":
        left, right, relation, answer = fact.get("left"), fact.get("right"), fact.get("relation"), fact.get("answer")
        expected = {"greater": left > right, "less": left < right, "equal": left == right}.get(relation) if isinstance(left, int) and isinstance(right, int) else None
        return expected is not None and expected and str(answer) == str(left if relation == "greater" else right if relation == "less" else left)
    if task_type in {"NUMBER_RECOGNITION", "COUNTING", "SHAPE_RECOGNITION"} and operation == "recognition":
        correct, allowed = fact.get("correct_value"), fact.get("allowed_distractors")
        return isinstance(correct, str) and isinstance(allowed, list) and len(allowed) >= 3 and correct not in allowed and len(set([correct, *allowed])) >= 4
    return False


def _ints(fact: dict, *keys: str) -> bool:
    return all(isinstance(fact.get(key), int) for key in keys)


def stable_position(row_id: str) -> int:
    return int(hashlib.sha256(row_id.encode("utf-8")).hexdigest()[:8], 16) % 4


def _unique(values: list[str], correct: str) -> list[str]:
    output = []
    for value in values:
        value = str(value)
        if value.casefold() != correct.casefold() and value.casefold() not in {v.casefold() for v in output}:
            output.append(value)
    return output


def deterministic_options(row: dict) -> tuple[list[str], str]:
    expected = str(row["source_expected"]["answer"])
    task_type = row["task_type"]
    if task_type in {"ADDITION", "SUBTRACTION", "MISSING_NUMBER", "SEQUENCE"}:
        answer = int(expected)
        candidates = [str(answer + delta) for delta in (-2, -1, 1, 2, 3) if answer + delta >= 0]
    else:
        candidates = [str(v) for v in row["source_expected"].get("distractors", [])]
    distractors = _unique(candidates, expected)
    index = 0
    while len(distractors) < 3:
        candidate = f"{expected}-{len(distractors) + 1}"
        if candidate.casefold() != expected.casefold() and candidate.casefold() not in {v.casefold() for v in distractors}:
            distractors.append(candidate)
        index += 1
    options = distractors[:3]
    position = stable_position(row["id"])
    options.insert(position, expected)
    return options, "ABCD"[position]


def language_pass(text: str, language: str) -> bool:
    arabic = len(_ARABIC_TOKEN_RE.findall(text))
    latin = len(_LATIN_TOKEN_RE.findall(text))
    if language == "ar":
        return arabic >= 2 and arabic >= latin
    return latin >= 2 and arabic == 0


def build_final(row: dict, model_output: dict) -> dict | None:
    if row["subject"] == "MATH" and not verify_fact(row["fact_payload"]):
        return None
    options, letter = deterministic_options(row)
    correct = str(row["source_expected"]["answer"])
    return {"question": model_output["question"], "options": options, "correct_letter": letter, "explanation": model_output["explanation"], "provenance": {"question": "MODEL", "explanation": "MODEL", "correct_answer": "CURRICULUM_FACT", "options": "DETERMINISTIC_CURRICULUM_ENGINE", "correct_letter": "DETERMINISTIC_POSITIONING"}, "integrity": {"four_unique_options": len({v.casefold() for v in options}) == 4, "correct_answer_present_once": sum(v.casefold() == correct.casefold() for v in options) == 1, "selected_answer_matches": options[ord(letter) - 65] == correct}}


def retry_model(generate: Callable[[int], str], row: dict) -> tuple[dict | None, int, list[str]]:
    raws = []
    for attempt, beams in enumerate((1, 2, 4), start=1):
        raw = generate(beams)
        raws.append(raw)
        try:
            parsed = parse_short(raw)
        except ValueError:
            continue
        if language_pass(f"{parsed['question']} {parsed['explanation']}", row["language"]):
            return parsed, attempt, raws
    return None, len(raws), raws
