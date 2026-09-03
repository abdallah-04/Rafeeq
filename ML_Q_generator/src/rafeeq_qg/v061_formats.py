from __future__ import annotations

import re

SHORT_SENTINELS = ("<extra_id_0>", "<extra_id_1>", "<extra_id_2>")
_SENTINEL_RE = re.compile(r"<extra_id_(\d+)>")


def serialize_short(question: str, explanation: str) -> str:
    if not question.strip() or not explanation.strip():
        raise ValueError("question and explanation must be non-empty")
    return f"<extra_id_0> {question.strip()} <extra_id_1> {explanation.strip()} <extra_id_2>"


def serialize_short_row(row: dict) -> str:
    expected = row["training_expected"]
    return serialize_short(expected["question"], expected["explanation"])


def parse_short(raw: str) -> dict:
    matches = list(_SENTINEL_RE.finditer(raw))
    ids = [int(match.group(1)) for match in matches]
    if ids != [0, 1, 2]:
        raise ValueError("short sentinel structure must contain exactly extra_id_0, extra_id_1, extra_id_2 once")
    if raw[:matches[0].start()].strip() or raw[matches[-1].end():].strip():
        raise ValueError("unexpected content outside short sentinel structure")
    question = raw[matches[0].end():matches[1].start()].strip()
    explanation = raw[matches[1].end():matches[2].start()].strip()
    if not question or not explanation:
        raise ValueError("short sentinel question and explanation must be non-empty")
    return {"question": question, "explanation": explanation}
