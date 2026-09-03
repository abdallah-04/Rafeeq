from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from rafeeq_qg.v061_formats import serialize_short
from rafeeq_qg.v061_hybrid import APPROVED_LANGUAGE_TASK_TYPES, APPROVED_MATH_TASK_TYPES

SOURCE = ROOT / "data" / "v05" / "master_v05.jsonl"
OUT = ROOT / "data" / "v062"


def task(row: dict) -> str:
    unit = row["curriculum_unit_id"]
    if row["subject"] == "MATH":
        mapping = (("number", "NUMBER_RECOGNITION"), ("shape", "SHAPE_RECOGNITION"), ("compare", "COMPARISON"), ("missing", "MISSING_NUMBER"), ("subtract", "SUBTRACTION"), ("sequence", "SEQUENCE"), ("add", "ADDITION"), ("context", "COUNTING"))
        approved = APPROVED_MATH_TASK_TYPES
    else:
        mapping = (("letter", "LETTER_RECOGNITION"), ("word", "WORD_RECOGNITION"), ("action", "ACTION_WORD"), ("meaning", "WORD_MEANING"), ("context", "SHORT_READING"), ("inference", "BASIC_INFERENCE"), ("punctuation", "CONTEXT_SELECTION"))
        approved = APPROVED_LANGUAGE_TASK_TYPES
    for marker, value in mapping:
        if f"-{marker}-" in unit:
            if value not in approved: raise ValueError(value)
            return value
    raise ValueError(f"unmapped task: {unit}")


def fact(row: dict, kind: str, pools: dict[tuple[str, str], list[str]] | None = None) -> dict | None:
    if row["subject"] != "MATH": return None
    answer_raw = str(row["source_expected"]["answer"]); answer = int(answer_raw) if answer_raw.isdigit() else answer_raw; content_nums = [int(value) for value in re.findall(r"\d+", row["content"])]
    question_nums = [int(value) for value in re.findall(r"\d+", row["source_expected"]["question"])]
    if kind in {"NUMBER_RECOGNITION", "SHAPE_RECOGNITION", "COUNTING"}:
        values = (pools or {}).get((row["language"], kind), row["source_expected"]["distractors"]); return {"task_type": kind, "operation": "recognition", "stimulus": row["content"], "correct_value": str(answer), "allowed_distractors": distinct_values(str(answer), values)}
    if kind == "ADDITION": return {"task_type": kind, "operation": "add", "operand_1": content_nums[0], "operand_2": content_nums[1], "answer": answer}
    if kind == "SUBTRACTION":
        match = re.search(r"subtract-(\d+)-(\d+)", row["curriculum_unit_id"]); a, b = (int(match.group(1)), int(match.group(2))) if match else content_nums[-2:]
        return {"task_type": kind, "operation": "subtract", "operand_1": a, "operand_2": b, "answer": answer}
    if kind == "MISSING_NUMBER": return {"task_type": kind, "operation": "missing_add", "known": content_nums[0], "total": content_nums[1], "answer": answer}
    if kind == "SEQUENCE":
        sequence = content_nums[:3]; return {"task_type": kind, "operation": "arithmetic_sequence", "sequence": sequence, "difference": sequence[1] - sequence[0], "answer": answer}
    if kind == "COMPARISON":
        left, right = question_nums[:2]; relation = "greater" if left > right else "less" if left < right else "equal"; return {"task_type": kind, "operation": "compare", "left": left, "right": right, "relation": relation, "answer": str(left if relation in {"greater", "equal"} else right)}
    raise ValueError(kind)


def distinct_values(correct: str, values: list[str]) -> list[str]:
    output = []
    for value in [str(item) for item in values]:
        if value.casefold() != correct.casefold() and value.casefold() not in {item.casefold() for item in output}:
            output.append(value)
        if len(output) == 3: return output
    raise ValueError(f"insufficient distinct curriculum distractors for {correct}")


def signature(kind: str, row: dict) -> str:
    if row["subject"] == "MATH":
        payload = row["fact_payload"] or {}; values = [str(payload.get(key)) for key in ("operand_1", "operand_2", "known", "total", "left", "right", "relation", "sequence", "answer") if payload.get(key) is not None]
        return "|".join([kind, *values, hashlib.sha256(row["content"].casefold().encode()).hexdigest()[:10]])
    normalized = re.sub(r"[^\w\u0600-\u06FF]+", " ", f"{kind} {row['topic']} {row['content']} {row['source_expected']['answer']}").casefold().strip()
    return f"{kind}|{hashlib.sha256(normalized.encode()).hexdigest()[:16]}"


def historical(row: dict, pools: dict[tuple[str, str], list[str]]) -> dict:
    kind = task(row); output = dict(row); output.update({"id": f"{row['id']}-v062-historical", "curriculum_unit_id": f"{row['curriculum_unit_id']}-v062-historical", "skill_family": f"{row['subject']}_{kind}", "template_family": f"{row['subject']}_{kind}_CURRICULUM", "split": "train", "task_type": kind})
    output["source_expected"] = dict(row["source_expected"]); output["source_expected"]["distractors"] = curated_distractors(row, kind, pools)
    output["fact_payload"] = fact(row, kind, pools); output["instance_signature"] = signature(kind, output); output["input_condition"] = "\n".join(["task=generate_question", f"language={row['language']}", f"level={row['level']}", f"subject={row['subject']}", f"task_type={kind}", f"topic={row['topic']}", f"content={row['content']}", f"trusted_answer={row['source_expected']['answer']}"]); output["targets"] = {"short_sentinel_v062": serialize_short(row["training_expected"]["question"], row["training_expected"]["explanation"])}
    return output


def curated_distractors(row: dict, kind: str, pools: dict[tuple[str, str], list[str]]) -> list[str]:
    expected = str(row["source_expected"]["answer"]); values = []
    for value in pools.get((row["language"], kind), []):
        if value.casefold() != expected.casefold() and value.casefold() not in {item.casefold() for item in values}:
            values.append(value)
        if len(values) == 3: return values
    raise ValueError(f"insufficient trusted distractors for {row['id']}")


def new_pair(unit: dict, split: str) -> list[dict]:
    result = []
    for language in ("en", "ar"):
        answer = unit["answer_en"] if language == "en" else unit["answer_ar"]; question = unit["question_en"] if language == "en" else unit["question_ar"]; content = unit["content_en"] if language == "en" else unit["content_ar"]; explanation = unit["explanation_en"] if language == "en" else unit["explanation_ar"]; distractors = unit["distractors_en"] if language == "en" else unit["distractors_ar"]
        row = {"id": f"{unit['id']}-{language}", "curriculum_unit_id": unit["id"], "skill_family": unit["skill_family"], "template_family": unit["template_family"], "instance_signature": unit["instance_signature"], "level": unit["level"], "subject": unit["subject"], "language": language, "split": split, "task_type": unit["task_type"], "topic": unit["topic_en"] if language == "en" else unit["topic_ar"], "content": content, "source_expected": {"question": question, "answer": answer, "distractors": distractors, "explanation": explanation}, "training_expected": {"question": question, "options": [answer, *distractors], "correct_letter": "A", "correct_option": 1, "explanation": explanation}, "fact_payload": unit.get("fact_payload")}
        row["input_condition"] = "\n".join(["task=generate_question", f"language={language}", f"level={unit['level']}", f"subject={unit['subject']}", f"task_type={unit['task_type']}", f"topic={row['topic']}", f"content={content}", f"trusted_answer={answer}"]); row["targets"] = {"short_sentinel_v062": serialize_short(question, explanation)}; result.append(row)
    return result


def new_units(split: str) -> list[dict]:
    math = []
    banks = {"validation": [("ADDITION", 2, 5, "garden"), ("SUBTRACTION", 9, 4, "kitchen"), ("MISSING_NUMBER", 3, 7, "desk"), ("SEQUENCE", 2, 4, "library"), ("COMPARISON", 8, 5, "park"), ("ADDITION", 4, 3, "class"), ("SUBTRACTION", 10, 6, "home"), ("MISSING_NUMBER", 4, 9, "shop"), ("SEQUENCE", 3, 6, "yard"), ("COMPARISON", 7, 2, "garden"), ("ADDITION", 6, 2, "kitchen"), ("SUBTRACTION", 12, 5, "desk"), ("MISSING_NUMBER", 5, 11, "library"), ("SEQUENCE", 4, 8, "park"), ("COMPARISON", 9, 4, "class")], "test": [("ADDITION", 3, 6, "museum"), ("SUBTRACTION", 11, 3, "station"), ("MISSING_NUMBER", 6, 10, "balcony"), ("SEQUENCE", 5, 10, "market"), ("COMPARISON", 10, 3, "farm"), ("ADDITION", 7, 4, "river"), ("SUBTRACTION", 13, 7, "museum"), ("MISSING_NUMBER", 7, 12, "station"), ("SEQUENCE", 6, 12, "balcony"), ("COMPARISON", 11, 5, "market"), ("ADDITION", 8, 3, "farm"), ("SUBTRACTION", 14, 6, "river"), ("MISSING_NUMBER", 8, 13, "museum"), ("SEQUENCE", 7, 14, "station"), ("COMPARISON", 12, 4, "balcony")]}
    for index, (kind, a, b, context) in enumerate(banks[split]):
        level = index // 5 + 1; answer = a + b if kind == "ADDITION" else a - b if kind == "SUBTRACTION" else b - a if kind == "MISSING_NUMBER" else b + 2 * (b - a) if kind == "SEQUENCE" else max(a, b); third = b + (b-a); question_en = {"ADDITION": f"How many cubes are there altogether: {a} and {b}?", "SUBTRACTION": f"What is {a} minus {b}?", "MISSING_NUMBER": f"What number completes {a} + ? = {b}?", "SEQUENCE": f"What comes next: {a}, {b}, {third}?", "COMPARISON": f"Which number is greater, {a} or {b}?"}[kind]; question_ar = {"ADDITION": f"كم عدد المكعبات كلها: {a} و{b}؟", "SUBTRACTION": f"ما ناتج {a} ناقص {b}؟", "MISSING_NUMBER": f"ما العدد المفقود في {a} + ؟ = {b}؟", "SEQUENCE": f"ما العدد التالي: {a}، {b}، {third}؟", "COMPARISON": f"أي العددين أكبر: {a} أم {b}؟"}[kind]; content_en = f"A learner uses {a} blue cubes and {b} red cubes at the {context}."; content_ar = f"لدى المتعلم {a} مكعبات زرقاء و{b} مكعبات حمراء في {context}."; distractors = [str(max(0, answer-1)), str(answer+1), str(answer+2)]; math.append({"id": f"v062-new-{split}-math-{index+1:02d}", "level": level, "subject": "MATH", "task_type": kind, "topic_en": kind.title(), "topic_ar": {"ADDITION": "الجمع", "SUBTRACTION": "الطرح", "MISSING_NUMBER": "العدد المفقود", "SEQUENCE": "النمط العددي", "COMPARISON": "مقارنة الأعداد"}[kind], "content_en": content_en, "content_ar": content_ar, "question_en": question_en, "question_ar": question_ar, "answer_en": str(answer), "answer_ar": str(answer), "distractors_en": distractors, "distractors_ar": distractors, "explanation_en": f"The verified curriculum fact gives {answer}.", "explanation_ar": f"الحقيقة التعليمية الموثقة تعطي العدد {answer}.", "skill_family": f"MATH_{kind}", "template_family": f"MATH_{kind}_OBJECT_COMBINATION", "instance_signature": f"{kind}|{a}|{b}|{context}", "fact_payload": {"task_type": kind, "operation": "add" if kind == "ADDITION" else "subtract" if kind == "SUBTRACTION" else "missing_add" if kind == "MISSING_NUMBER" else "arithmetic_sequence" if kind == "SEQUENCE" else "compare", "operand_1": a, "operand_2": b, "answer": answer} if kind in {"ADDITION", "SUBTRACTION"} else {"task_type": kind, "operation": "missing_add", "known": a, "total": b, "answer": answer} if kind == "MISSING_NUMBER" else {"task_type": kind, "operation": "arithmetic_sequence", "sequence": [a, b, third], "difference": b-a, "answer": answer} if kind == "SEQUENCE" else {"task_type": kind, "operation": "compare", "left": a, "right": b, "relation": "greater" if a > b else "less", "answer": str(max(a,b))}})
    language = []
    lang_bank = {"validation": [("pencil", "قلم", "WORD_RECOGNITION", "desk"), ("runs", "يركض", "ACTION_WORD", "yard"), ("a tool for writing", "أداة للكتابة", "WORD_MEANING", "class"), ("a child finds a pencil", "يجد طفل قلما", "SHORT_READING", "library"), ("the learner opens the notebook", "يفتح المتعلم الدفتر", "BASIC_INFERENCE", "home")], "test": [("apple", "تفاحة", "WORD_RECOGNITION", "kitchen"), ("claps", "يصفق", "ACTION_WORD", "museum"), ("a fruit", "فاكهة", "WORD_MEANING", "market"), ("a child washes an apple", "يغسل طفل تفاحة", "SHORT_READING", "balcony"), ("the learner shares the fruit", "يشارك المتعلم الفاكهة", "BASIC_INFERENCE", "farm")]}
    for index in range(15):
        answer_en, answer_ar, kind, context = lang_bank[split][index % 5]; level = index // 5 + 1; level_context = ["morning", "afternoon", "evening"][level - 1]; level_context_ar = ["الصباح", "بعد الظهر", "المساء"][level - 1]; distractors_en = [["eraser", "chair", "window"], ["sits", "reads", "sleeps"], ["a color", "a number", "a place"], ["a child closes a book", "a teacher sleeps", "a bell rings"], ["the learner leaves", "the learner forgets", "the learner hides"]][index % 5]; distractors_ar = [["ممحاة", "كرسي", "نافذة"], ["يجلس", "يقرأ", "ينام"], ["لون", "عدد", "مكان"], ["يغلق طفل كتابا", "ينام معلم", "يرن جرس"], ["يغادر المتعلم", "ينسى المتعلم", "يخفي المتعلم"]][index % 5]; language.append({"id": f"v062-new-{split}-language-{index+1:02d}", "level": level, "subject": "LANGUAGE", "task_type": kind, "topic_en": kind.title(), "topic_ar": "درس لغوي جديد", "content_en": f"A learner studies the word {answer_en} in the {context} during the {level_context}.", "content_ar": f"يدرس المتعلم كلمة {answer_ar} في {context} خلال {level_context_ar}.", "question_en": f"Which answer matches the lesson about {answer_en} during the {level_context}?", "question_ar": f"أي إجابة تناسب درس {answer_ar} خلال {level_context_ar}؟", "answer_en": answer_en, "answer_ar": answer_ar, "distractors_en": distractors_en, "distractors_ar": distractors_ar, "explanation_en": f"The lesson uses {answer_en}.", "explanation_ar": f"يستخدم الدرس كلمة {answer_ar}.", "skill_family": f"LANGUAGE_{kind}", "template_family": f"LANGUAGE_{kind}_CONTEXT", "instance_signature": f"{kind}|{answer_en}|{context}|{level_context}"})
    return [row for unit in math + language for row in new_pair(unit, split)]


def main() -> None:
    source_rows = [json.loads(line) for line in SOURCE.read_text(encoding="utf-8").splitlines() if line.strip()]; pools = {}
    for source_row in source_rows:
        kind = task(source_row); pools.setdefault((source_row["language"], kind), []).extend(str(value) for value in source_row["source_expected"].get("distractors", []))
    historical_rows = [historical(row, pools) for row in source_rows]; rows = historical_rows + new_units("validation") + new_units("test"); OUT.mkdir(parents=True, exist_ok=True)
    with (OUT / "master_v062.jsonl").open("w", encoding="utf-8", newline="\n") as handle:
        for row in rows: handle.write(json.dumps(row, ensure_ascii=False) + "\n")
    manifest = {"version": "v0.6.2", "counts": {split: sum(row["split"] == split for row in rows) for split in ("train", "validation", "test")}, "historical_training_pool": "v05 frozen conditions; observed v05/v06/v061 evaluation records are training-only in this new experiment", "new_validation_units": sorted({row["curriculum_unit_id"] for row in rows if row["split"] == "validation"}), "new_hidden_test_units": sorted({row["curriculum_unit_id"] for row in rows if row["split"] == "test"})}
    (OUT / "split_manifest_v062.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"); print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__": main()
