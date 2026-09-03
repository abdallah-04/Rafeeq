import json
from pathlib import Path
from rafeeq_qg.v064_formats import parse_question
from rafeeq_qg.v064_planner import level_style,semantic_binding
ROOT=Path(__file__).parents[1]
def rows(): return [json.loads(x) for x in (ROOT/"data/v064/train_v064.jsonl").read_text(encoding="utf8").splitlines() if x.strip()]
def sanity_rows():
    allr=rows();out=[]
    for lang in ("ar","en"):
      for sub in ("MATH","LANGUAGE"):
       for lev in (1,2,3):out += [r for r in allr if r["language"]==lang and r["subject"]==sub and r["level"]==lev][:2]
    return out
def test_gold_audit_reproduces_inconsistency_without_hidden_access():
    rs=sanity_rows();assert len(rs)==24; assert sum(semantic_binding(r,parse_question(r["targets"]["question_only_v064"])) for r in rs)==21;assert sum(level_style(r,parse_question(r["targets"]["question_only_v064"]))["compatible"] for r in rs)==18
def test_extended_gate_requires_two_consecutive_evaluations():
    history=[{"parse":24,"language":24,"semantic":21,"level_style":18},{"parse":24,"language":24,"semantic":24,"level_style":20}]
    qualifies=lambda x:x["parse"]>=22 and x["language"]>=22 and x["semantic"]>=22 and x["level_style"]>=20
    assert not all(qualifies(x) for x in history);assert sum(qualifies(x) for x in history)<2
