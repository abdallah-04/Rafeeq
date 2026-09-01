from __future__ import annotations

from dataclasses import dataclass


TAGS = ("QUESTION", "OPTION_A", "OPTION_B", "OPTION_C", "OPTION_D", "CORRECT", "EXPLANATION")
SENTINEL_PREFIX = "<extra_id_"


@dataclass(frozen=True)
class CompactQuestion:
    question: str
    options: tuple[str, str, str, str]
    correct_option: int
    explanation: str


def format_compact_target(question: CompactQuestion) -> str:
    correct_letter = "ABCD"[question.correct_option - 1]
    lines = [
        f"<QUESTION> {question.question}",
        f"<OPTION_A> {question.options[0]}",
        f"<OPTION_B> {question.options[1]}",
        f"<OPTION_C> {question.options[2]}",
        f"<OPTION_D> {question.options[3]}",
        f"<CORRECT> {correct_letter}",
        f"<EXPLANATION> {question.explanation}",
    ]
    return "\n".join(lines)


def parse_compact_target(raw: str) -> CompactQuestion:
    if SENTINEL_PREFIX in raw:
        raise ValueError("mT5 sentinel token is not a valid compact target")
    lines = [line.strip() for line in raw.strip().splitlines() if line.strip()]
    if len(lines) != len(TAGS):
        raise ValueError("compact target must contain exactly seven non-empty tagged lines")
    values: dict[str, str] = {}
    for expected, line in zip(TAGS, lines):
        prefix = f"<{expected}>"
        if not line.startswith(prefix):
            raise ValueError(f"expected {prefix} line")
        value = line[len(prefix):].strip()
        if not value:
            raise ValueError(f"{expected} cannot be empty")
        values[expected] = value
    if values["CORRECT"] not in {"A", "B", "C", "D"}:
        raise ValueError("CORRECT must be A, B, C, or D")
    options = tuple(values[f"OPTION_{letter}"] for letter in "ABCD")
    if len(set(option.casefold() for option in options)) != 4:
        raise ValueError("options must be unique")
    return CompactQuestion(
        question=values["QUESTION"],
        options=options,
        correct_option="ABCD".index(values["CORRECT"]) + 1,
        explanation=values["EXPLANATION"],
    )
