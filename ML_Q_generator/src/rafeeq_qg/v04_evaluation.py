from __future__ import annotations

import re
from collections import Counter

from .v04_formats import content_match, parse_sentinel

_ARABIC_RE = re.compile(r"[\u0600-\u06FF]")
_TOKEN_RE = re.compile(r"[\w\u0600-\u06FF]+", re.UNICODE)


def selected_answer(parsed: dict | None) -> str | None:
    if not parsed:
        return None
    letter = parsed.get("correct_letter")
    if letter not in {"A", "B", "C", "D"}:
        return None
    return parsed["options"][ord(letter) - ord("A")]


def language_matches(text: str, language: str) -> bool:
    has_arabic = bool(_ARABIC_RE.search(text))
    return has_arabic if language == "ar" else not has_arabic


def lexical_grounding_ratio(row: dict, parsed: dict | None) -> float:
    if not parsed:
        return 0.0
    source = f"{row.get('topic', '')} {row.get('content', '')} {row.get('source_expected', {}).get('answer', '')}"
    generated = f"{parsed.get('question', '')} {selected_answer(parsed) or ''} {parsed.get('explanation', '')}"
    source_tokens = {token.casefold() for token in _TOKEN_RE.findall(source) if len(token) > 1 or token.isdigit()}
    generated_tokens = {token.casefold() for token in _TOKEN_RE.findall(generated) if len(token) > 1 or token.isdigit()}
    if not generated_tokens:
        return 0.0
    return len(source_tokens & generated_tokens) / len(generated_tokens)


def classify_failure(error: str | None, raw: str, parsed: dict | None, row: dict) -> list[str]:
    failures: list[str] = []
    if parsed is None:
        message = (error or "").lower()
        if "sentinel" in message:
            failures.append("sentinel_structure")
        if "unique" in message:
            failures.append("duplicate_option")
        if not failures:
            failures.append("malformed_output")
        if len(raw.strip()) < 5:
            failures.append("truncated_generation")
        return failures

    if len(set(option.casefold() for option in parsed["options"])) != 4:
        failures.append("duplicate_option")
    if parsed["correct_letter"] not in {"A", "B", "C", "D"}:
        failures.append("invalid_correct_letter")
    expected_answer = row["source_expected"]["answer"]
    if expected_answer not in parsed["options"]:
        failures.append("expected_answer_missing")
    if selected_answer(parsed) != expected_answer:
        failures.append("answer_inconsistent")
    language_text = f"{parsed['question']} {parsed['explanation']}"
    if not language_matches(language_text, row["language"]):
        failures.append("wrong_language")
    return failures


def evaluate_raw_output(row: dict, raw: str) -> dict:
    parsed = None
    error = None
    try:
        parsed = parse_sentinel(raw)
    except ValueError as exc:
        error = str(exc)

    expected = row["training_expected"]
    selected = selected_answer(parsed)
    expected_answer = row["source_expected"]["answer"]
    exact_fields = content_match(parsed, expected)
    language_text = f"{parsed['question']} {parsed['explanation']}" if parsed else ""
    failures = classify_failure(error, raw, parsed, row)
    return {
        "id": row["id"],
        "curriculum_unit_id": row["curriculum_unit_id"],
        "level": row["level"],
        "language": row["language"],
        "subject": row["subject"],
        "topic": row["topic"],
        "content": row["content"],
        "input_condition": row["input_condition"],
        "expected_target": row["targets"]["sentinel_native_v2"],
        "raw_output": raw,
        "parsed": parsed,
        "strict_parse": parsed is not None,
        "expected_answer": expected_answer,
        "selected_answer": selected,
        "answer_consistent": parsed is not None and selected == expected_answer,
        "expected_answer_present": parsed is not None and expected_answer in parsed["options"],
        "language_pass": parsed is not None and language_matches(language_text, row["language"]),
        "lexical_grounding_heuristic": lexical_grounding_ratio(row, parsed),
        "exact_field_matches": exact_fields,
        "exact_field_matches_out_of": 7,
        "failure_reason": error,
        "failure_categories": failures,
    }


def aggregate_results(results: list[dict]) -> dict:
    count = len(results)
    failures = Counter(category for result in results for category in result["failure_categories"])
    return {
        "conditions": count,
        "strict_parse_count": sum(result["strict_parse"] for result in results),
        "answer_consistency_count": sum(result["answer_consistent"] for result in results),
        "expected_answer_present_count": sum(result["expected_answer_present"] for result in results),
        "language_pass_count": sum(result["language_pass"] for result in results),
        "exact_field_matches": sum(result["exact_field_matches"] for result in results),
        "exact_field_matches_out_of": count * 7,
        "mean_lexical_grounding_heuristic": (
            sum(result["lexical_grounding_heuristic"] for result in results) / count if count else 0.0
        ),
        "failure_categories": dict(failures),
    }


def validation_rank(metrics: dict, validation_loss: float) -> tuple:
    malformed = metrics["conditions"] - metrics["strict_parse_count"]
    return (
        metrics["strict_parse_count"],
        metrics["answer_consistency_count"],
        metrics["exact_field_matches"],
        -malformed,
        -validation_loss,
    )
