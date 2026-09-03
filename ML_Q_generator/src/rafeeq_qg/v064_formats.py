from __future__ import annotations

import re

def serialize_question(question: str) -> str:
    return f"<extra_id_0> {question.strip()} <extra_id_1>"

def parse_question(text: str) -> str:
    match=re.fullmatch(r"\s*<extra_id_0>\s*(.+?)\s*<extra_id_1>\s*",text,flags=re.S)
    if not match or not match.group(1).strip(): raise ValueError("invalid v0.6.4 question sentinel")
    return match.group(1).strip()
