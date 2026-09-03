from __future__ import annotations
import hashlib,json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/"src"))
from rafeeq_qg.v064b_planner import plan_text,question,explanation
from rafeeq_qg.v064_formats import serialize_question
SRC=ROOT/"data/v064/master_v064.jsonl";OUT=ROOT/"data/v064b"
def transform(r):
    r=dict(r);r["id"]=r["id"].replace("v064","v064b");r["curriculum_unit_id"]=r["curriculum_unit_id"].replace("v064","v064b");r.pop("input_condition",None);r.pop("targets",None);r.pop("training_expected",None)
    f=dict(r.get("fact_payload") or {})
    if r["task_type"]=="NUMBER_RECOGNITION":f={"task_type":"NUMBER_RECOGNITION","operation":"recognition","shown_numeral":r["source_expected"]["answer"]}
    elif r["task_type"]=="SHAPE_RECOGNITION":
        props={"circle":"round,no_sides","دائرة":"مستدير,بلا_أضلاع","square":"four_equal_sides","مربع":"أربعة_أضلاع_متساوية","triangle":"three_sides","مثلث":"ثلاثة_أضلاع","rectangle":"two_long_two_short_sides","مستطيل":"ضلعان_طويلان_وضلعان_قصيران","star":"pointed_tips","نجمة":"أطراف_مدببة"};f={"task_type":"SHAPE_RECOGNITION","operation":"recognition","shape_properties":props.get(r["source_expected"]["answer"],"visual_shape_features")}
    elif r["task_type"]=="COUNTING":f={"task_type":"COUNTING","operation":"quantity_change","stimulus":f.get("stimulus",r.get("content",""))}
    r["fact_payload"]=f
    if r["task_type"]=="CONTEXT_SELECTION":r["stimulus_sentence"]="I went home" if r["language"]=="en" else "ذهبت إلى البيت"
    if r["subject"]=="LANGUAGE":
        answer=str(r["source_expected"]["answer"]);r["stimulus_context"]=re.sub(re.escape(answer),"[target]",str(r.get("content","")),flags=re.I)
    r["stimulus_fingerprint"]=hashlib.sha256(str(r.get("id",r.get("curriculum_unit_id",""))).casefold().encode()).hexdigest()[:12]
    r["semantic_plan"]={};r["input_condition"]=plan_text(r);r["semantic_plan"]=json.loads(json.dumps({"text":r["input_condition"]}))
    q=question(r);r["source_expected"]["question"]=q;r["source_expected"]["explanation"]=explanation(r);r["targets"]={"question_only_v064b":serialize_question(q)};r["instance_signature"]=hashlib.sha256(json.dumps([r["curriculum_unit_id"],r["task_type"],r.get("fact_payload"),r.get("stimulus_sentence"),r.get("passage"),r["language"]],ensure_ascii=False,sort_keys=True).casefold().encode()).hexdigest()[:20];return r
def main():
    rows=[transform(json.loads(x)) for x in SRC.read_text(encoding="utf8").splitlines() if x.strip()];OUT.mkdir(parents=True,exist_ok=True)
    for split,name in (("train","train_v064b.jsonl"),("validation","validation_v064b.jsonl"),("test","hidden_test_v064b.jsonl")):(OUT/name).write_text("".join(json.dumps(r,ensure_ascii=False)+"\n" for r in rows if r["split"]==split),encoding="utf8")
    (OUT/"master_v064b.jsonl").write_text("".join(json.dumps(r,ensure_ascii=False)+"\n" for r in rows),encoding="utf8");(OUT/"split_manifest_v064b.json").write_text(json.dumps({"version":"v0.6.4b","counts":{s:sum(r["split"]==s for r in rows) for s in ("train","validation","test")}},indent=2)+"\n",encoding="utf8")
if __name__=="__main__":main()
