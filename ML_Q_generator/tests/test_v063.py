import json
from pathlib import Path

from rafeeq_qg.v063_hybrid import canonical_question, explanation_answer_consistency, semantic_binding, build_final

ROOT=Path(__file__).parents[1]

def rows(): return [json.loads(x) for x in (ROOT/"data"/"v063"/"master_v063.jsonl").read_text(encoding="utf8").splitlines() if x.strip()]

def test_v063_dataset_shape_and_planner_input():
    data=rows(); assert len(data)==600; assert {s:sum(r["split"]==s for r in data) for s in ("train","validation","test")}=={"train":480,"validation":60,"test":60}
    assert all("canonical_question=" in r["input_condition"] and "distractors" not in r["input_condition"] for r in data)

def test_semantic_validator_distinguishes_operations():
    row=next(r for r in rows() if r["task_type"]=="ADDITION" and r["language"]=="en")
    assert semantic_binding(row,canonical_question(row)); assert not semantic_binding(row,f"What is {row['fact_payload']['operand_1']} minus {row['fact_payload']['operand_2']}?")

def test_arabic_digits_and_explanation_consistency():
    row=next(r for r in rows() if r["task_type"]=="ADDITION" and r["language"]=="ar")
    assert semantic_binding(row,canonical_question(row).replace(str(row["fact_payload"]["operand_1"]),"١"))
    assert explanation_answer_consistency(row,f"الإجابة الصحيحة هي {row['source_expected']['answer']}.")

def test_canonical_fallback_has_valid_provenance_and_explanation():
    row=next(r for r in rows() if r["subject"]=="MATH" and r["task_type"]=="SUBTRACTION")
    result=build_final(row,{"question":"wrong","explanation":"wrong"},fallback=True)
    assert result["provenance"]["question_source"]=="CANONICAL_FALLBACK"; assert result["integrity"]["semantic_binding"]; assert result["integrity"]["explanation_answer_consistency"]
