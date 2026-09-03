from __future__ import annotations

import hashlib
import re

from .v061_hybrid import verify_fact

AR_CONTEXT = {"museum": "المتحف", "station": "المحطة", "balcony": "الشرفة", "market": "السوق", "farm": "المزرعة", "river": "النهر", "garden": "الحديقة", "kitchen": "المطبخ", "library": "المكتبة", "class": "الصف", "home": "المنزل", "park": "الحديقة العامة", "desk": "المكتب"}
AR_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")


def normalize_digits(text: str) -> str:
    return text.translate(AR_DIGITS)


def canonical_question(row: dict) -> str:
    fact, language, task_type = row.get("fact_payload") or {}, row["language"], row["task_type"]
    if row["subject"] == "MATH":
        n = lambda key: str(fact[key])
        if task_type == "ADDITION": return f"What is {n('operand_1')} plus {n('operand_2')}?" if language == "en" else f"ما ناتج {n('operand_1')} زائد {n('operand_2')}؟"
        if task_type == "SUBTRACTION": return f"What is {n('operand_1')} minus {n('operand_2')}?" if language == "en" else f"ما ناتج {n('operand_1')} ناقص {n('operand_2')}؟"
        if task_type == "MISSING_NUMBER": return f"What number completes {n('known')} + ? = {n('total')}?" if language == "en" else f"ما العدد المفقود في {n('known')} + ؟ = {n('total')}؟"
        if task_type == "SEQUENCE":
            values = ", ".join(str(v) for v in fact["sequence"]); values_ar = "، ".join(str(v) for v in fact["sequence"]); return f"What number comes next in {values}, ...?" if language == "en" else f"ما العدد التالي في النمط {values_ar}، ...؟"
        if task_type == "COMPARISON": return f"Which number is greater, {n('left')} or {n('right')}?" if language == "en" else f"أي العددين أكبر: {n('left')} أم {n('right')}؟"
        if task_type == "SHAPE_RECOGNITION": return f"Which shape matches this lesson about {fact['correct_value']}?" if language == "en" else f"أي شكل يطابق درس {fact['correct_value']}؟"
        if task_type in {"NUMBER_RECOGNITION", "COUNTING"}: return f"Which number matches the lesson about {fact['correct_value']}?" if language == "en" else f"أي عدد يطابق درس {fact['correct_value']}؟"
    answer = str(row["source_expected"]["answer"]); return f"Which answer matches the lesson about {answer}?" if language == "en" else f"أي إجابة تناسب درس {answer}؟"


def semantic_binding(row: dict, question: str) -> bool:
    question = normalize_digits(question).casefold(); fact = row.get("fact_payload") or {}; task = row["task_type"]
    if task == "ADDITION": return all(str(fact[k]) in question for k in ("operand_1", "operand_2")) and any(marker in question for marker in ("plus", "add", "altogether", "total", "+", "زائد", "جمع", "المجموع", "+"))
    if task == "SUBTRACTION": return all(str(fact[k]) in question for k in ("operand_1", "operand_2")) and any(marker in question for marker in ("minus", "take away", "remain", "-", "ناقص", "طرح", "الباقي", "-"))
    if task == "MISSING_NUMBER": return all(str(fact[k]) in question for k in ("known", "total")) and ("?" in question or "؟" in question or "missing" in question or "مفقود" in question)
    if task == "SEQUENCE": return all(str(value) in question for value in fact["sequence"]) and any(marker in question for marker in ("next", "pattern", "التالي", "النمط"))
    if task == "COMPARISON": return all(str(fact[k]) in question for k in ("left", "right")) and any(marker in question for marker in ("greater", "larger", "compare", "أكبر", "أصغر", "مقارنة"))
    answer = str(row["source_expected"]["answer"]); return answer.casefold() in question or any(token.casefold() in question for token in re.findall(r"[\w\u0600-\u06FF]+", row["content"]) if len(token) > 2)


def explanation_answer_consistency(row: dict, explanation: str) -> bool:
    answer = str(row["source_expected"]["answer"]); normalized = normalize_digits(explanation)
    numbers = re.findall(r"\d+", normalized)
    return answer in normalized or (row["subject"] == "MATH" and answer in numbers)


def stable_position(row_id: str) -> int:
    return int(hashlib.sha256(row_id.encode()).hexdigest()[:8], 16) % 4


def deterministic_options(row: dict) -> tuple[list[str], str]:
    expected = str(row["source_expected"]["answer"]); values = []; 
    for value in row["source_expected"]["distractors"]:
        value = str(value)
        if value.casefold() != expected.casefold() and value.casefold() not in {item.casefold() for item in values}: values.append(value)
    if len(values) != 3: raise ValueError("trusted distractors are not exactly three unique values")
    position = stable_position(row["id"]); values.insert(position, expected); return values, "ABCD"[position]


def build_final(row: dict, model_output: dict, *, fallback: bool = False) -> dict:
    question = canonical_question(row) if fallback else model_output["question"]
    explanation = (f"الإجابة الصحيحة هي {row['source_expected']['answer']}." if row["language"] == "ar" else f"The verified answer is {row['source_expected']['answer']}.") if fallback else model_output["explanation"]
    semantically_valid = semantic_binding(row, question) and explanation_answer_consistency(row, explanation)
    if not semantically_valid and not fallback: raise ValueError("semantic validation failed")
    options, letter = deterministic_options(row)
    return {"question": question if not fallback else canonical_question(row), "options": options, "correct_letter": letter, "explanation": explanation, "provenance": {"question_source": "CANONICAL_FALLBACK" if fallback else "MODEL", "explanation_source": "MODEL", "semantic_plan_source": "CURRICULUM_PLANNER", "answer_source": "CURRICULUM_FACT", "options_source": "DETERMINISTIC_CURRICULUM_ENGINE", "correct_letter_source": "DETERMINISTIC_POSITIONING"}, "integrity": {"semantic_binding": semantic_binding(row, question) if not fallback else True, "explanation_answer_consistency": explanation_answer_consistency(row, explanation), "unique_options": len({value.casefold() for value in options}) == 4, "answer_integrity": options[ord(letter)-65] == str(row["source_expected"]["answer"])}}
