import json
from pathlib import Path
from rafeeq_qg.v064_formats import parse_question
from rafeeq_qg.v064b_planner import level_style,plan_text,semantic_binding
ROOT=Path(__file__).parents[1]
def rows():return [json.loads(x) for x in (ROOT/"data/v064b/train_v064b.jsonl").read_text(encoding="utf8").splitlines() if x.strip()]
def sanity():
    rs=rows();out=[]
    for lang in ("ar","en"):
      for sub in ("MATH","LANGUAGE"):
       for lev in (1,2,3):out += [r for r in rs if r["language"]==lang and r["subject"]==sub and r["level"]==lev][:2]
    return out
def test_corrected_gold_sanity_is_clean():
    rs=sanity();assert len(rs)==24;assert all(semantic_binding(r,parse_question(r["targets"]["question_only_v064b"])) for r in rs);assert all(level_style(r,parse_question(r["targets"]["question_only_v064b"]))["compatible"] for r in rs)
def test_answer_label_and_unit_id_absent_from_plan():
    for r in rows():assert not any(x in r["input_condition"] for x in ("answer=","trusted_answer","correct_value=","unit_id=","distractors","correct_letter"))
def test_counting_plan_uses_quantity_changes():
    r=next(x for x in rows() if x["task_type"]=="COUNTING");assert "start_count=" in r["input_condition"] and "removed_count=" in r["input_condition"] and "added_count=" in r["input_condition"] and "correct_value=" not in r["input_condition"]
def test_context_selection_and_action_goals_are_semantic():
    for task in ("CONTEXT_SELECTION","ACTION_WORD"):
        r=next(x for x in rows() if x["task_type"]==task);q=parse_question(r["targets"]["question_only_v064b"]);assert semantic_binding(r,q)
def test_question_copy_leakage_is_zero():
    assert all(parse_question(r["targets"]["question_only_v064b"]) not in r["input_condition"] for r in rows())
