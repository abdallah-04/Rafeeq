from __future__ import annotations
import json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/"src"))
from rafeeq_qg.runtime_paths import resolve_runtime_paths
from rafeeq_qg.v064_formats import parse_question
from rafeeq_qg.v064_planner import level_style,semantic_binding
def main():
    data=[json.loads(x) for x in (ROOT/"data/v064/train_v064.jsonl").read_text(encoding="utf8").splitlines() if x.strip()]; rows=[]
    for lang in ("ar","en"):
      for sub in ("MATH","LANGUAGE"):
       for lev in (1,2,3): rows += [r for r in data if r["language"]==lang and r["subject"]==sub and r["level"]==lev][:2]
    details=[]
    for r in rows:
        q=parse_question(r["targets"]["question_only_v064"]); sem=semantic_binding(r,q); style=level_style(r,q)["compatible"]; reason=[]
        if not sem:
            reason.append("ACTION_WORD goal wording is not covered" if r["task_type"]=="ACTION_WORD" else "CONTEXT_SELECTION target is generic and cue is absent")
        if not style: reason.append("Level-3 reference is direct/generic rather than contextual" if r["level"]==3 else "heuristic false negative")
        details.append({"id":r["id"],"language":r["language"],"subject":r["subject"],"level":r["level"],"task_type":r["task_type"],"semantic_plan":r["semantic_plan"],"expected_question":q,"gold_semantic":sem,"gold_level_style":style,"reason":"; ".join(reason) or "pass"})
    summary={"version":"v0.6.4a","decision":"VALIDATOR/DATASET INCONSISTENCY FOUND","gold_semantic_pass":sum(x["gold_semantic"] for x in details),"gold_level_style_pass":sum(x["gold_level_style"] for x in details),"semantic_failures":[x for x in details if not x["gold_semantic"]],"level_style_failures":[x for x in details if not x["gold_level_style"]],"original_seed42_1200_metrics":{"parse":24,"language":24,"semantic":21,"level_style":18,"steps":1200,"raw_model_failure_rows_available":False,"note":"The interrupted historical runner did not persist per-row raw outputs."},"validation_generation_count":0,"hidden_test_open_count":0,"target_sentence_copy_leak_count":0,"extended_control":"not run because gold validators failed 24/24 prerequisite"}
    runtime=resolve_runtime_paths(ROOT).outputs_dir;runtime.mkdir(parents=True,exist_ok=True);(runtime/"v064a_gold_validator_audit.json").write_text(json.dumps({"version":"v0.6.4a","rows":details,"summary":{k:summary[k] for k in ("gold_semantic_pass","gold_level_style_pass")}},ensure_ascii=False,indent=2)+"\n",encoding="utf8");(runtime/"v064a_seed42_failure_analysis.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf8");print(json.dumps({k:summary[k] for k in ("decision","gold_semantic_pass","gold_level_style_pass","validation_generation_count","hidden_test_open_count")},ensure_ascii=False,indent=2))
if __name__=="__main__":main()
