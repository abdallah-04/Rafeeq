from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from rafeeq_qg.v061_formats import serialize_short

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "v05" / "master_v05.jsonl"
OUT = ROOT / "data" / "v061"


def explicit_task(row: dict) -> str:
    unit = row["curriculum_unit_id"]
    if row["subject"] == "MATH":
        for marker, task in (("number", "NUMBER_RECOGNITION"), ("shape", "SHAPE_RECOGNITION"), ("compare", "COMPARISON"), ("missing", "MISSING_NUMBER"), ("subtract", "SUBTRACTION"), ("sequence", "SEQUENCE"), ("add", "ADDITION"), ("context", "COUNTING")):
            if f"-{marker}-" in unit:
                return task
        raise ValueError(f"unmapped math unit: {unit}")
    for marker, task in (("letter", "LETTER_RECOGNITION"), ("word", "WORD_RECOGNITION"), ("action", "ACTION_WORD"), ("meaning", "WORD_MEANING"), ("context", "SHORT_READING"), ("inference", "BASIC_INFERENCE"), ("punctuation", "CONTEXT_SELECTION")):
        if f"-{marker}-" in unit:
            return task
    raise ValueError(f"unmapped language unit: {unit}")


def fact(row: dict, task: str) -> dict | None:
    if row["subject"] != "MATH":
        return None
    answer = row["source_expected"]["answer"]
    nums = [int(v) for v in re.findall(r"\d+", row["content"])]
    question_nums = [int(v) for v in re.findall(r"\d+", row["source_expected"]["question"])]
    if task in {"NUMBER_RECOGNITION", "SHAPE_RECOGNITION"}:
        return {"task_type": task, "operation": "recognition", "stimulus": row["content"], "correct_value": str(answer), "allowed_distractors": distinct_distractors(str(answer), row["source_expected"]["distractors"])}
    if task == "COUNTING":
        return {"task_type": task, "operation": "recognition", "stimulus": row["content"], "correct_value": str(answer), "allowed_distractors": distinct_distractors(str(answer), row["source_expected"]["distractors"])}
    if task == "ADDITION":
        return {"task_type": task, "operation": "add", "operand_1": nums[0], "operand_2": nums[1], "answer": int(answer)}
    if task == "SUBTRACTION":
        match = re.search(r"subtract-(\d+)-(\d+)", row["curriculum_unit_id"]); a, b = (int(match.group(1)), int(match.group(2))) if match else nums[-2:]
        return {"task_type": task, "operation": "subtract", "operand_1": a, "operand_2": b, "answer": int(answer)}
    if task == "MISSING_NUMBER":
        return {"task_type": task, "operation": "missing_add", "known": nums[0], "total": nums[1], "answer": int(answer)}
    if task == "SEQUENCE":
        difference = nums[1] - nums[0]
        return {"task_type": task, "operation": "arithmetic_sequence", "sequence": nums[:3], "difference": difference, "answer": int(answer)}
    if task == "COMPARISON":
        left, right = question_nums[:2]; relation = "greater" if left > right else "less" if left < right else "equal"
        return {"task_type": task, "operation": "compare", "left": left, "right": right, "relation": relation, "answer": str(left if relation in {"greater", "equal"} else right)}
    raise ValueError(task)


def distinct_distractors(correct: str, values: list[str]) -> list[str]:
    output = []
    for value in [str(v) for v in values] + ["unknown", "other", "none"]:
        if value.casefold() != correct.casefold() and value.casefold() not in {v.casefold() for v in output}:
            output.append(value)
        if len(output) == 3:
            return output
    return output


def make_row(row: dict, split: str, suffix: str) -> dict:
    task = explicit_task(row); output = dict(row); output["id"] = f"{row['id']}-v061-{suffix}"; output["curriculum_unit_id"] = f"{row['curriculum_unit_id']}-v061-{suffix}"; output["concept_family"] = f"{row['concept_family']}-v061-{suffix}"; output["template_family"] = f"{row['concept_family']}-v061-template-{task.lower()}"; output["historical_split"] = split; output["task_type"] = task; output["fact_payload"] = fact(row, task); output["input_condition"] = "\n".join(["task=generate_question", f"language={row['language']}", f"level={row['level']}", f"subject={row['subject']}", f"task_type={task}", f"topic={row['topic']}", f"content={row['content']}"]); output["targets"] = {"short_sentinel_v061": serialize_short(row["training_expected"]["question"], row["training_expected"]["explanation"])}
    return output


def new_rows(split: str) -> list[dict]:
    math_templates = [("ADDITION", "MATH", "What is {a} plus {b}?", "A learner combines {a} blue tiles with {b} red tiles.", lambda a, b: a + b), ("SUBTRACTION", "MATH", "What is {a} minus {b}?", "A learner has {a} shells and gives away {b}.", lambda a, b: a - b), ("MISSING_NUMBER", "MATH", "What number completes the equation {a} + ? = {total}?", "The missing part joins {a} to make {total}.", lambda a, b: b - a), ("SEQUENCE", "MATH", "What number comes next: {a}, {b}, {c}, ?", "The numbers increase by equal steps.", lambda a, b: b + (b - a)), ("COMPARISON", "MATH", "Which number is greater, {a} or {b}?", "Two baskets contain {a} and {b} counters.", lambda a, b: max(a, b))]
    language_templates = [("WORD_RECOGNITION", "Which word names the object?", "The pictured classroom object is called {answer}."), ("ACTION_WORD", "Which word shows an action?", "The action word in this lesson is {answer}."), ("WORD_MEANING", "What does the word mean?", "The lesson explains that {answer} is the intended meaning."), ("SHORT_READING", "What happened in the short passage?", "The passage says that {answer}."), ("BASIC_INFERENCE", "What can the learner infer?", "The context supports the idea that {answer}.")]
    rows = []; ordinal = 0
    for level in (1, 2, 3):
        for kind, subject, question, content_template, calculate in math_templates:
            ordinal += 1; a, b = level * 2 + ordinal, level + 2
            if kind == "MISSING_NUMBER": total, answer, c = a + b, b, a + 4
            elif kind == "SEQUENCE": b, c, answer, total = a + 2, a + 4, a + 6, a + 6
            else: answer, total, c = calculate(a, b), a + b, a + 2
            distractors = [str(answer - 1), str(answer + 1), str(answer + 2)]; unit = {"id": f"v061-new-{split}-math-{level}-{ordinal}", "topic": kind.title(), "content": content_template.format(a=a, b=b, total=total), "question": question.format(a=a, b=b, c=c, total=total), "answer": str(answer), "distractors": distractors, "explanation": f"The verified answer is {answer}.", "task": kind, "a": a, "b": b, "c": c, "total": total}; rows.extend(make_new_pair(unit, level, subject, split))
        for kind, question, content_template in language_templates:
            ordinal += 1; answer = ["book", "jump", "a place to read", "a child opens a book", "the learner should wait"][language_templates.index((kind, question, content_template))]; unit = {"id": f"v061-new-{split}-language-{level}-{ordinal}", "topic": kind.title(), "content": content_template.format(answer=answer), "question": question, "answer": answer, "distractors": ["table", "sleep", "a color"], "explanation": f"The curriculum answer is {answer}.", "task": kind}; rows.extend(make_new_pair(unit, level, "LANGUAGE", split))
    return rows


def make_new_pair(unit: dict, level: int, subject: str, split: str) -> list[dict]:
    result = []
    for language in ("ar", "en"):
        answer = unit["answer"] if language == "en" else (str(unit["answer"]) if subject == "MATH" else {"book": "كتاب", "jump": "يقفز", "a place to read": "مكان للقراءة", "a child opens a book": "طفل يفتح كتابا", "the learner should wait": "ينبغي للمتعلم أن ينتظر"}[unit["answer"]])
        question = unit["question"] if language == "en" else f"ما السؤال المناسب عن {unit['topic']}؟"
        content = (unit["content"] + (" This is a validation instance." if split == "validation" else " This is a hidden-test instance.")) if language == "en" else f"يتعلم الطالب عن {unit['topic']} في موقف جديد ({split})."
        explanation = unit["explanation"] if language == "en" else f"الإجابة الصحيحة هي {answer}."
        row = {"id": f"{unit['id']}-{language}", "curriculum_unit_id": unit["id"], "concept_family": f"v061-{split}-{subject.lower()}-family-{level}", "level": level, "subject": subject, "language": language, "historical_split": split, "topic": unit["topic"] if language == "en" else f"{unit['topic']} جديد", "content": content, "source_expected": {"question": question, "answer": answer, "distractors": unit["distractors"], "explanation": explanation}, "training_expected": {"question": question, "options": [answer, *unit["distractors"]], "correct_letter": "A", "correct_option": 1, "explanation": explanation}}
        task = unit["task"]; row["task_type"] = task; row["template_family"] = f"v061-{split}-template-{task.lower()}"; row["fact_payload"] = new_fact(unit, task) if subject == "MATH" else None; row["input_condition"] = "\n".join(["task=generate_question", f"language={language}", f"level={level}", f"subject={subject}", f"task_type={task}", f"topic={row['topic']}", f"content={content}"]); row["targets"] = {"short_sentinel_v061": serialize_short(question, explanation)}
        result.append(row)
    return result


def new_fact(unit: dict, task: str) -> dict:
    if task == "ADDITION": return {"task_type": task, "operation": "add", "operand_1": unit["a"], "operand_2": unit["b"], "answer": int(unit["answer"])}
    if task == "SUBTRACTION": return {"task_type": task, "operation": "subtract", "operand_1": unit["a"], "operand_2": unit["b"], "answer": int(unit["answer"])}
    if task == "MISSING_NUMBER": return {"task_type": task, "operation": "missing_add", "known": unit["a"], "total": unit["total"], "answer": int(unit["answer"])}
    if task == "SEQUENCE": return {"task_type": task, "operation": "arithmetic_sequence", "sequence": [unit["a"], unit["b"], unit["c"]], "difference": unit["b"] - unit["a"], "answer": int(unit["answer"])}
    if task == "COMPARISON": return {"task_type": task, "operation": "compare", "left": unit["a"], "right": unit["b"], "relation": "greater" if unit["a"] > unit["b"] else "less", "answer": unit["answer"]}
    raise ValueError(task)


def main() -> None:
    historical = [make_row(json.loads(line), "train", "historical") for line in SOURCE.read_text(encoding="utf-8").splitlines() if line.strip()]
    rows = historical + new_rows("validation") + new_rows("test")
    OUT.mkdir(parents=True, exist_ok=True)
    with (OUT / "master_v061.jsonl").open("w", encoding="utf-8", newline="\n") as handle:
        for row in rows: handle.write(json.dumps(row, ensure_ascii=False) + "\n")
    manifest = {"version": "v0.6.1", "counts": {split: sum(r["historical_split"] == split for r in rows) for split in ("train", "validation", "test")}, "new_unit_ids": sorted({r["curriculum_unit_id"] for r in rows if r["historical_split"] != "train"}), "historical_training_pool": "v05 frozen conditions transformed to short target; v0.5/v0.6 tests are historical and are training only", "v061_hidden_test_loaded_only_after_selection": True}
    (OUT / "split_manifest_v061.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__": main()
