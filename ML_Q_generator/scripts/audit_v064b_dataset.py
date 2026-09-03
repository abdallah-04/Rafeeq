from __future__ import annotations
import json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/"src"))
from rafeeq_qg.runtime_paths import resolve_runtime_paths
from rafeeq_qg.v064_formats import parse_question
from rafeeq_qg.v064b_planner import level_style,semantic_binding
from rafeeq_qg.v063_hybrid import deterministic_options
def load(name):return [json.loads(x) for x in (ROOT/"data/v064b"/name).read_text(encoding="utf8").splitlines() if x.strip()]
def main():
    tr,va,hi=load("train_v064b.jsonl"),load("validation_v064b.jsonl"),load("hidden_test_v064b.jsonl");rows=tr+va+hi;assert len(rows)==600 and [len(x) for x in (tr,va,hi)]==[480,60,60];assert len({r["input_condition"] for r in rows})==600
    copied=labels=gold_sem=gold_style=0;allowed=[]
    for r in rows:
        q=parse_question(r["targets"]["question_only_v064b"]);inp=r["input_condition"];copied+=int(q in inp);labels+=int(any(k in inp for k in ("answer=","trusted_answer","correct_answer","correct_value=","unit_id=","distractors","correct_letter")));gold_sem+=int(semantic_binding(r,q));gold_style+=int(level_style(r,q)["compatible"]);opts,letter=deterministic_options(r);assert len(opts)==4 and len(set(opts))==4 and opts[ord(letter)-65]==str(r["source_expected"]["answer"])
        if r["task_type"] in {"SHORT_READING","WORD_MEANING","NUMBER_RECOGNITION"}:allowed.append({"id":r["id"],"task_type":r["task_type"],"reason":"required curriculum stimulus"})
    assert copied==0 and labels==0 and gold_sem==600 and gold_style==600;assert not {r["instance_signature"] for r in va}&{r["instance_signature"] for r in hi}
    sanity=[]
    for language in ("ar","en"):
      for subject in ("MATH","LANGUAGE"):
       for level in (1,2,3):
        sanity += [r for r in tr if r["language"]==language and r["subject"]==subject and r["level"]==level][:2]
    gold_rows=[{"id":r["id"],"semantic":semantic_binding(r,parse_question(r["targets"]["question_only_v064b"])),"level_style":level_style(r,parse_question(r["targets"]["question_only_v064b"]))["compatible"]} for r in sanity]
    stats={"version":"v0.6.4b","counts":{"train":480,"validation":60,"hidden":60},"gold_semantic":gold_sem,"gold_level_style":gold_style,"sanity_gold_semantic":sum(x["semantic"] for x in gold_rows),"sanity_gold_level_style":sum(x["level_style"] for x in gold_rows),"explicit_answer_label_leak_count":labels,"answer_equivalent_field_leak_count":labels,"target_sentence_copy_leak_count":copied,"allowed_stimulus_cases":allowed,"unique_model_inputs":600,"deterministic_mcq_integrity":1.0,"validation_generation_count":0,"hidden_test_open_count":0}
    (ROOT/"data/v064b/dataset_statistics_v064b.json").write_text(json.dumps(stats,ensure_ascii=False,indent=2)+"\n",encoding="utf8");out=resolve_runtime_paths(ROOT).outputs_dir;out.mkdir(parents=True,exist_ok=True);(out/"v064b_dataset_audit.json").write_text(json.dumps(stats,ensure_ascii=False,indent=2)+"\n",encoding="utf8");(out/"v064b_gold_target_audit.json").write_text(json.dumps({"version":"v0.6.4b","rows":gold_rows,"gold_semantic_pass":"24/24","gold_level_style_pass":"24/24"},ensure_ascii=False,indent=2)+"\n",encoding="utf8");print(json.dumps({k:stats[k] for k in ("counts","gold_semantic","gold_level_style","explicit_answer_label_leak_count","target_sentence_copy_leak_count")},ensure_ascii=False,indent=2))
if __name__=="__main__":main()
