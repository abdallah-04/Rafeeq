from __future__ import annotations

import re

SENTINELS = tuple(f"<extra_id_{index}>" for index in range(8))
PLAIN_FIELDS = ("Q:", "A:", "B:", "C:", "D:", "ANS:", "EXP:")


def serialize_sentinel(row: dict) -> str:
    expected = row["training_expected"]
    values = [expected["question"], *expected["options"], expected["correct_letter"], expected["explanation"]]
    return " ".join(f"{SENTINELS[index]} {value}" for index, value in enumerate(values)) + " <extra_id_7>"


def serialize_plain(row: dict) -> str:
    expected = row["training_expected"]
    return "\n".join([
        f"Q: {expected['question']}",
        f"A: {expected['options'][0]}",
        f"B: {expected['options'][1]}",
        f"C: {expected['options'][2]}",
        f"D: {expected['options'][3]}",
        f"ANS: {expected['correct_letter']}",
        f"EXP: {expected['explanation']}",
    ])


def parse_sentinel(raw: str) -> dict:
    positions = [raw.find(token) for token in SENTINELS]
    if any(position < 0 for position in positions) or positions != sorted(positions):
        raise ValueError("sentinel fields must contain extra_id_0 through extra_id_7 in order")
    if any(raw.find(token, positions[index] + len(token)) >= 0 for index, token in enumerate(SENTINELS[:-1])):
        raise ValueError("ambiguous extra sentinel structure")
    values = [raw[positions[index] + len(SENTINELS[index]):positions[index + 1]].strip() for index in range(7)]
    if not values[0] or any(not value for value in values[1:5]) or values[5] not in {"A", "B", "C", "D"} or not values[6]:
        raise ValueError("invalid sentinel field content")
    if len(set(value.casefold() for value in values[1:5])) != 4:
        raise ValueError("options must be unique")
    return {"question": values[0], "options": values[1:5], "correct_letter": values[5], "explanation": values[6]}


def parse_plain(raw: str) -> dict:
    lines = [line.strip() for line in raw.strip().splitlines() if line.strip()]
    if len(lines) != len(PLAIN_FIELDS) or any(not lines[index].startswith(field) for index, field in enumerate(PLAIN_FIELDS)):
        raise ValueError("plain target must contain Q/A/B/C/D/ANS/EXP in order")
    values = [line.split(":", 1)[1].strip() for line in lines]
    if any(not value for value in values) or values[5] not in {"A", "B", "C", "D"}:
        raise ValueError("invalid plain field content")
    if len(set(value.casefold() for value in values[1:5])) != 4:
        raise ValueError("options must be unique")
    return {"question": values[0], "options": values[1:5], "correct_letter": values[5], "explanation": values[6]}


def content_match(parsed: dict | None, expected: dict) -> int:
    if parsed is None:
        return 0
    fields = ["question", "correct_letter", "explanation"]
    matches = sum(parsed[field] == expected[field if field != "correct_letter" else "correct_letter"] for field in fields)
    matches += sum(left == right for left, right in zip(parsed["options"], expected["options"]))
    return matches
