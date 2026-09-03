from __future__ import annotations
import hashlib,json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; sys.path.insert(0,str(ROOT/"src"))
from rafeeq_qg.v061_hybrid import verify_fact
from rafeeq_qg.v064_formats import serialize_question
from rafeeq_qg.v064_planner import AR_CONTEXT,plan,plan_text,question,deterministic_explanation
SRC=ROOT/"data"/"v063"/"master_v063.jsonl"; OUT=ROOT/"data"/"v064"
def add_lang_fields(row):
    task=row["task_type"]; row["question_goal"]={"WORD_RECOGNITION":"choose_matching_word","ACTION_WORD":"choose_action_word","WORD_MEANING":"choose_meaning","SHORT_READING":"retrieve_object","BASIC_INFERENCE":"infer_scene","LETTER_RECOGNITION":"choose_matching_letter","CONTEXT_SELECTION":"choose_context"}.get(task,"choose_matching_answer")
    row["semantic_cue"]={"WORD_RECOGNITION":"fruit/food category","ACTION_WORD":"movement on foot","WORD_MEANING":"word meaning","SHORT_READING":"object in passage","BASIC_INFERENCE":"scene consequence","LETTER_RECOGNITION":"first lesson letter","CONTEXT_SELECTION":"lesson context"}.get(task,"lesson concept")
    row["stimulus"] = row.get("stimulus", "")
    if task=="WORD_MEANING" and not row["stimulus"]: row["stimulus"]="apple" if row["language"]=="en" else "تفاحة"
    if task in {"SHORT_READING","BASIC_INFERENCE"} and not row.get("passage"): row["passage"]="Sara put a pencil in the bag before school." if row["language"]=="en" else "وضعت سارة قلما في الحقيبة قبل المدرسة."
    return row
def make(row,split,uid):
    row=dict(row); row["id"]=uid+"-"+row["language"]; row["curriculum_unit_id"]=uid; row["split"]=split; row.pop("input_condition",None); row.pop("targets",None); row.pop("training_expected",None)
    if row["subject"]=="LANGUAGE": add_lang_fields(row)
    row["semantic_plan"]=plan(row); row["instance_signature"]=hashlib.sha256(json.dumps([row["curriculum_unit_id"],row["task_type"],row.get("fact_payload"),row.get("semantic_cue"),row.get("stimulus"),row.get("passage"),row["language"]],ensure_ascii=False,sort_keys=True).casefold().encode()).hexdigest()[:20]
    target=question(row); answer=str(row["source_expected"]["answer"]); explanation=deterministic_explanation(row); row["source_expected"]["question"]=target; row["source_expected"]["explanation"]=explanation
    row["input_condition"]=plan_text(row); row["targets"]={"question_only_v064":serialize_question(target)}; row["training_expected"]={"question":target,"explanation":explanation}; return row
def main():
    source=[json.loads(x) for x in SRC.read_text(encoding="utf8").splitlines() if x.strip()]; train=[]
    for r in source:
        if r["split"]=="train": train.append(make(r,"train",r["curriculum_unit_id"]+"-v064"))
    banks={"validation":[(15,3),(18,5),(9,17),(4,7),(19,12),(16,6),(21,8),(11,20),(6,10),(23,14),(22,7),(25,9),(13,24),(8,13),(27,16)],"test":[(51,8),(54,11),(14,49),(19,27),(52,18),(56,9),(59,12),(17,55),(21,31),(58,24),(61,10),(63,14),(19,60),(23,35),(65,26)]}
    rows=[]
    for split,bank in banks.items():
        for i,(a,b) in enumerate(bank):
            task=("ADDITION","SUBTRACTION","MISSING_NUMBER","SEQUENCE","COMPARISON")[i%5]; ans=a+b if task=="ADDITION" else a-b if task=="SUBTRACTION" else b-a if task=="MISSING_NUMBER" else b+2*(b-a) if task=="SEQUENCE" else max(a,b); third=b+(b-a); payload={"task_type":task,"operation":{"ADDITION":"add","SUBTRACTION":"subtract","MISSING_NUMBER":"missing_add","SEQUENCE":"arithmetic_sequence","COMPARISON":"compare"}[task]}
            if task in {"ADDITION","SUBTRACTION"}: payload.update(operand_1=a,operand_2=b,answer=ans)
            elif task=="MISSING_NUMBER": payload.update(known=a,total=b,answer=ans)
            elif task=="SEQUENCE": payload.update(sequence=[a,b,third],difference=b-a,answer=ans)
            else: payload.update(left=a,right=b,relation="greater" if a>b else "less",answer=str(ans))
            for lang in ("en","ar"):
                content=f"A learner works with {a} and {b}." if lang=="en" else f"يتدرب المتعلم على العددين {a} و{b}."; base={"level":i//5+1,"subject":"MATH","language":lang,"task_type":task,"topic":task,"content":content,"fact_payload":payload,"source_expected":{"question":"","answer":str(ans),"distractors":[str(max(0,ans-1)),str(ans+1),str(ans+2)],"explanation":""},"skill_family":"MATH_"+task,"template_family":"MATH_"+task+"_LEVEL_STYLE"}; rows.append(make(base,split,f"v064-{'v' if split=='validation' else 'h'}-math-{i+1:02d}"))
        lang_bank=[("pencil","قلم","WORD_RECOGNITION"),("runs","يركض","ACTION_WORD"),("a fruit","فاكهة","WORD_MEANING"),("pencil","قلما","SHORT_READING"),("shares the fruit","يشارك الفاكهة","BASIC_INFERENCE")]
        for i in range(15):
            en,ar,task=lang_bank[i%5]
            for lang in ("en","ar"):
                answer=en if lang=="en" else ar; ds=["eraser","chair","window"] if lang=="en" else ["ممحاة","كرسي","نافذة"]; base={"level":i//5+1,"subject":"LANGUAGE","language":lang,"task_type":task,"topic":task,"content":"A learner studies a category or scene." if lang=="en" else "يدرس المتعلم فئة أو مشهدا.","source_expected":{"question":"","answer":answer,"distractors":ds,"explanation":""},"skill_family":"LANGUAGE_"+task,"template_family":"LANGUAGE_"+task+"_LEVEL_STYLE","semantic_cue":"fruit category" if task=="WORD_RECOGNITION" else "movement on foot" if task=="ACTION_WORD" else "word meaning" if task=="WORD_MEANING" else "object in passage" if task=="SHORT_READING" else "scene consequence","stimulus":"apple" if task=="WORD_MEANING" and lang=="en" else "تفاحة" if task=="WORD_MEANING" else "","passage":"Sara put a pencil in the bag before school." if task=="SHORT_READING" and lang=="en" else "وضعت سارة قلما في الحقيبة قبل المدرسة." if task=="SHORT_READING" else ""}; rows.append(make(base,split,f"v064-{'v' if split=='validation' else 'h'}-language-{i+1:02d}"))
    all_rows=train+rows; OUT.mkdir(parents=True,exist_ok=True)
    for split,name in (("train","train_v064.jsonl"),("validation","validation_v064.jsonl"),("test","hidden_test_v064.jsonl")):
        (OUT/name).write_text("".join(json.dumps(r,ensure_ascii=False)+"\n" for r in all_rows if r["split"]==split),encoding="utf8")
    (OUT/"master_v064.jsonl").write_text("".join(json.dumps(r,ensure_ascii=False)+"\n" for r in all_rows),encoding="utf8")
    (OUT/"split_manifest_v064.json").write_text(json.dumps({"version":"v0.6.4","counts":{s:sum(r["split"]==s for r in all_rows) for s in ("train","validation","test")},"hidden_physical_file":"hidden_test_v064.jsonl"},ensure_ascii=False,indent=2)+"\n",encoding="utf8")
if __name__=="__main__": main()
