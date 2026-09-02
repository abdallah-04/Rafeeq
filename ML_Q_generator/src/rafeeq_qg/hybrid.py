from __future__ import annotations

from dataclasses import dataclass

from .v04_evaluation import language_matches, selected_answer


@dataclass(frozen=True)
class MathFact:
    operation: str
    answer: int
    operand_1: int | None = None
    operand_2: int | None = None


def verify_math_fact(fact: dict) -> bool:
    operation = fact.get("operation")
    if operation in {"add", "subtract"}:
        a, b, answer = fact.get("operand_1"), fact.get("operand_2"), fact.get("answer")
        return all(isinstance(value, int) for value in (a, b, answer)) and (a + b if operation == "add" else a - b) == answer
    if operation == "missing_add":
        known, total, answer = fact.get("known"), fact.get("total"), fact.get("answer")
        return all(isinstance(value, int) for value in (known, total, answer)) and known + answer == total
    if operation == "compare":
        left, right, relation = fact.get("left"), fact.get("right"), fact.get("relation")
        return isinstance(left, int) and isinstance(right, int) and relation in {"greater", "less", "equal"} and ((left > right and relation == "greater") or (left < right and relation == "less") or (left == right and relation == "equal"))
    if operation == "sequence":
        sequence, answer = fact.get("sequence"), fact.get("next")
        return isinstance(sequence, list) and len(sequence) >= 2 and isinstance(answer, int) and (sequence[-1] - sequence[-2]) == (answer - sequence[-1])
    return isinstance(fact.get("answer"), (int, str))


def deterministic_distractors(answer: int, position: int = 0) -> tuple[list[str], str]:
    candidates = []
    for delta in (-2, -1, 1, 2, 3):
        value = answer + delta
        if value >= 0 and value != answer and str(value) not in candidates:
            candidates.append(str(value))
        if len(candidates) == 3:
            break
    values = candidates[:]
    values.insert(position % 4, str(answer))
    return values, "ABCD"[position % 4]


def validated_output_acceptance(results: list[dict]) -> float:
    if not results:
        return 0.0
    return sum(bool(result.get("accepted")) for result in results) / len(results)


def curriculum_answer(row: dict) -> int | str:
    """Read the independently authored curriculum fact, never model output."""
    fact = row.get("fact_payload") or {}
    answer = fact.get("answer")
    if answer is None:
        answer = row["source_expected"]["answer"]
    return answer


def apply_math_hybrid(row: dict, parsed: dict | None) -> dict | None:
    """Repair only math answer fields from a verified fact and deterministic options."""
    fact = row.get("fact_payload")
    if row.get("subject") != "MATH" or not fact or not verify_math_fact(fact) or parsed is None:
        return None
    answer = curriculum_answer(row)
    if not isinstance(answer, int):
        return None
    position = int(row["training_expected"]["correct_option"]) - 1
    options, letter = deterministic_distractors(answer, position)
    repaired = dict(parsed)
    repaired["options"] = options
    repaired["correct_letter"] = letter
    repaired["explanation"] = f"The verified curriculum fact gives {answer}."
    return repaired


def accept_v06_output(row: dict, parsed: dict | None, *, hybrid: dict | None = None) -> dict:
    """Return auditable acceptance flags without comparing generated text to the target."""
    final = hybrid or parsed
    if final is None:
        return {"accepted": False, "math_programmatic": False, "language_pass": False, "reason": "no_parse"}
    expected = curriculum_answer(row)
    expected_option = str(expected) if isinstance(expected, int) else expected
    selected = selected_answer(final)
    language_text = f"{final.get('question', '')} {final.get('explanation', '')}"
    language_pass = language_matches(language_text, row["language"])
    math_programmatic = row.get("subject") != "MATH" or selected == expected_option
    return {
        "accepted": bool(selected == expected_option and language_pass and len(set(v.casefold() for v in final["options"])) == 4),
        "math_programmatic": math_programmatic,
        "language_pass": language_pass,
        "answer_source": "DETERMINISTIC_CURRICULUM_FACT" if hybrid else "MODEL",
        "options_source": "DETERMINISTIC_DISTRACTOR_ENGINE" if hybrid else "MODEL",
        "question_source": "MODEL",
    }


def retry_language(generate_attempt, max_attempts: int = 3) -> tuple[dict | None, int]:
    """Retry the same input only; the callback receives no target or expected answer."""
    for attempt in range(1, max_attempts + 1):
        parsed = generate_attempt()
        if parsed is not None:
            return parsed, attempt
    return None, max_attempts
