import json
from pathlib import Path
from rafeeq_qg.v064_formats import parse_question,serialize_question
from rafeeq_qg.v064_planner import level_style,plan_text,question,semantic_binding
ROOT=Path(__file__).parents[1]
def data(): return [json.loads(x) for x in (ROOT/"data"/"v064"/"master_v064.jsonl").read_text(encoding="utf8").splitlines()]
def test_question_only_format():
    q="What is 3 + 2?"; assert parse_question(serialize_question(q))==q
def test_no_target_or_answer_input_leakage():
    for r in data():
        assert r["source_expected"]["question"] not in r["input_condition"]
        assert not any(x in r["input_condition"] for x in ("trusted_answer","correct_answer","canonical_question","distractors","correct_letter"))
def test_level_style_changes_targets():
    rows=[r for r in data() if r["subject"]=="MATH" and r["task_type"]=="ADDITION" and r["language"]=="en"]
    assert len({r["source_expected"]["question"] for r in rows if r["level"]==1})>0
    assert any("add" in r["source_expected"]["question"] for r in rows if r["level"]==2)
    assert any("child" in r["source_expected"]["question"] for r in rows if r["level"]==3)
def test_structured_plan_and_math_binding():
    r=next(r for r in data() if r["task_type"]=="ADDITION" and r["language"]=="en"); assert "operand_1=" in plan_text(r); assert semantic_binding(r,r["source_expected"]["question"])
def test_balanced_physical_splits():
    p=ROOT/"data"/"v064"; assert all((p/name).exists() for name in ("train_v064.jsonl","validation_v064.jsonl","hidden_test_v064.jsonl")); assert [len((p/name).read_text(encoding="utf8").splitlines()) for name in ("train_v064.jsonl","validation_v064.jsonl","hidden_test_v064.jsonl")] == [480,60,60]
