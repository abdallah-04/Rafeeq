from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "v05" / "master_v05.jsonl"
OUT = ROOT / "data" / "v06"


def task_type(row: dict) -> str:
    unit = row["curriculum_unit_id"]
    text = f"{unit} {row['topic']}".lower()
    mapping = [("missing", "MISSING_NUMBER"), ("add", "ADDITION"), ("subtract", "SUBTRACTION"), ("sequence", "SEQUENCE"), ("compare", "COMPARISON"), ("shape", "SHAPE_RECOGNITION"), ("number", "NUMBER_RECOGNITION"), ("letter", "LETTER_RECOGNITION"), ("action", "ACTION_WORD"), ("meaning", "WORD_MEANING"), ("context", "SHORT_READING"), ("punctuation", "CONTEXT_SELECTION"), ("inference", "BASIC_INFERENCE"), ("word", "WORD_RECOGNITION")]
    for marker, value in mapping:
        if marker in text:
            return value
    return "COUNTING" if row["subject"] == "MATH" else "VOCABULARY"


def fact(row: dict, kind: str) -> dict | None:
    if row["subject"] != "MATH":
        return None
    answer = row["source_expected"]["answer"]
    numbers = [int(value) for value in re.findall(r"\d+", row["content"])]
    if kind == "MISSING_NUMBER" and len(numbers) >= 2:
        known, total = numbers[0], numbers[1]
        return {"operation": "missing_add", "known": known, "total": total, "answer": int(answer) if answer.isdigit() else answer}
    if kind == "ADDITION" and len(numbers) >= 2:
        return {"operation": "add", "operand_1": numbers[0], "operand_2": numbers[1], "answer": int(answer) if answer.isdigit() else answer}
    if kind == "SUBTRACTION" and len(numbers) >= 2:
        match = re.search(r"subtract-(\d+)-(\d+)", row["curriculum_unit_id"])
        a, b = (int(match.group(1)), int(match.group(2))) if match else (numbers[-2], numbers[-1])
        return {"operation": "subtract", "operand_1": a, "operand_2": b, "answer": int(answer) if answer.isdigit() else answer}
    if kind == "SEQUENCE" and len(numbers) >= 3:
        return {"operation": "sequence", "sequence": numbers[:3], "next": int(answer) if answer.isdigit() else answer}
    return {"operation": kind.lower(), "answer": int(answer) if answer.isdigit() else answer}


def v06_split(concept_family: str) -> str:
    suffix = int(concept_family.rsplit("-", 1)[-1])
    if suffix == 6:
        return "validation"
    if suffix == 7:
        return "test"
    return "train"


def main() -> None:
    rows = [json.loads(line) for line in SOURCE.read_text(encoding="utf-8").splitlines() if line.strip()]
    output = []
    for row in rows:
        kind = task_type(row)
        updated = dict(row)
        updated["curriculum_id"] = "rafeeq-demo-curriculum-v06"
        updated["task_type"] = kind
        updated["template_family"] = f"{row['concept_family']}-template-{kind.lower()}"
        updated["fact_payload"] = fact(row, kind)
        updated["historical_split"] = v06_split(row["concept_family"])
        output.append(updated)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "curriculum_v06.json").write_text(json.dumps({"curriculum_id": "rafeeq-demo-curriculum-v06", "architecture": "Hybrid Curriculum-Grounded ML Question Generator", "units": [{key: value for key, value in row.items() if key not in {"id", "input_condition", "targets", "training_expected", "source_expected"}} for row in output[::2]]}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with (OUT / "master_v06.jsonl").open("w", encoding="utf-8", newline="\n") as handle:
        for row in output: handle.write(json.dumps(row, ensure_ascii=False) + "\n")
    families = {row["concept_family"]: row["historical_split"] for row in output}
    old_test_ids = {row["id"] for row in rows if row["historical_split"] == "test"}
    new_test_ids = {row["id"] for row in output if row["historical_split"] == "test"}
    manifest = {"version": "v06", "source": "v05 high-quality conditions; v05 frozen", "split_rule": "family-rotated split: family 06 validation, family 07 hidden test; v05 test family 08 is never v06 hidden test", "families": families, "v05_test_reuse_in_v06_hidden_test": sorted(old_test_ids & new_test_ids), "unit_membership": {split: sorted({row["curriculum_unit_id"] for row in output if row["historical_split"] == split}) for split in ("train", "validation", "test")}, "row_membership": {split: sorted(row["id"] for row in output if row["historical_split"] == split) for split in ("train", "validation", "test")}, "counts": {split: sum(row["historical_split"] == split for row in output) for split in ("train", "validation", "test")}}
    (OUT / "split_manifest_v06.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"rows": len(output), "units": len({row['curriculum_unit_id'] for row in output}), "task_types": dict(Counter(row['task_type'] for row in output)), "splits": manifest['counts']}, ensure_ascii=False, indent=2))


if __name__ == "__main__": main()
