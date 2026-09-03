from __future__ import annotations

import hashlib, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]; sys.path.insert(0, str(ROOT / "src"))
from rafeeq_qg.v061_formats import serialize_short
from rafeeq_qg.v063_hybrid import canonical_question

SOURCE = ROOT / "data" / "v05" / "master_v05.jsonl"; OUT = ROOT / "data" / "v063"
AR = {"museum":"المتحف", "station":"المحطة", "balcony":"الشرفة", "market":"السوق", "farm":"المزرعة", "river":"النهر", "garden":"الحديقة", "kitchen":"المطبخ", "library":"المكتبة", "class":"الصف", "home":"المنزل", "park":"الحديقة العامة", "desk":"المكتب", "yard":"الساحة", "shop":"المتجر", "house":"المنزل"}

def kind(row):
    markers = (("number","NUMBER_RECOGNITION"),("shape","SHAPE_RECOGNITION"),("compare","COMPARISON"),("missing","MISSING_NUMBER"),("subtract","SUBTRACTION"),("sequence","SEQUENCE"),("add","ADDITION"),("context","COUNTING")) if row["subject"] == "MATH" else (("letter","LETTER_RECOGNITION"),("word","WORD_RECOGNITION"),("action","ACTION_WORD"),("meaning","WORD_MEANING"),("context","SHORT_READING"),("inference","BASIC_INFERENCE"),("punctuation","CONTEXT_SELECTION"))
    for marker, value in markers:
        if f"-{marker}-" in row["curriculum_unit_id"]: return value
    raise ValueError(row["curriculum_unit_id"])

def fact(row, task):
    if row["subject"] != "MATH": return None
    answer = str(row["source_expected"]["answer"]); nums = [int(x) for x in re.findall(r"\d+", row["content"])]
    qnums = [int(x) for x in re.findall(r"\d+", row["source_expected"]["question"])]
    if task in {"NUMBER_RECOGNITION","COUNTING","SHAPE_RECOGNITION"}: return {"task_type":task,"operation":"recognition","stimulus":row["content"],"correct_value":answer,"allowed_distractors":[str(x) for x in row["source_expected"]["distractors"]]}
    if task == "SUBTRACTION":
        m = re.search(r"subtract-(\d+)-(\d+)", row["curriculum_unit_id"]); a,b = (int(m.group(1)),int(m.group(2))) if m else nums[-2:]
        return {"task_type":task,"operation":"subtract","operand_1":a,"operand_2":b,"answer":int(answer)}
    if task == "ADDITION": return {"task_type":task,"operation":"add","operand_1":nums[0],"operand_2":nums[1],"answer":int(answer)}
    if task == "MISSING_NUMBER": return {"task_type":task,"operation":"missing_add","known":nums[0],"total":nums[1],"answer":int(answer)}
    if task == "SEQUENCE": return {"task_type":task,"operation":"arithmetic_sequence","sequence":nums[:3],"difference":nums[1]-nums[0],"answer":int(answer)}
    if task == "COMPARISON":
        left,right=qnums[:2]; relation="greater" if left>right else "less" if left<right else "equal"
        return {"task_type":task,"operation":"compare","left":left,"right":right,"relation":relation,"answer":str(max(left,right))}
    return None

def signature(row):
    raw = json.dumps([row["task_type"], row.get("fact_payload"), row["language"], row["content"]], ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(raw.casefold().encode()).hexdigest()[:20]

def make_row(row, split, unit_id, task, content, topic, answer, distractors, explanation, payload):
    out={"id":unit_id+"-"+row["language"],"curriculum_unit_id":unit_id,"skill_family":row.get("skill_family",row["subject"]+"_"+task),"template_family":row.get("template_family",row["subject"]+"_"+task+"_PLANNER"),"level":row["level"],"subject":row["subject"],"language":row["language"],"split":split,"task_type":task,"topic":topic,"content":content,"source_expected":{"question":"","answer":str(answer),"distractors":[str(x) for x in distractors],"explanation":explanation},"fact_payload":payload}
    out["instance_signature"]=signature({**out,"fact_payload":payload}); out["source_expected"]["question"]=canonical_question(out)
    out["training_expected"]={"question":out["source_expected"]["question"],"options":[str(answer),*map(str,distractors)],"correct_letter":"A","correct_option":1,"explanation":explanation}
    out["input_condition"]="\n".join(["task=realize_question",f"language={out['language']}",f"level={out['level']}",f"subject={out['subject']}",f"task_type={task}",f"topic={topic}",f"content={content}",f"canonical_question={out['source_expected']['question']}",f"trusted_answer={answer}"])
    out["targets"]={"short_sentinel_v063":serialize_short(out["source_expected"]["question"],explanation)}; return out

def trusted_pool(rows):
    pools={}
    for row in rows:
        task=kind(row); key=(row["language"],task)
        pools.setdefault(key,[]).extend(str(x) for x in row["source_expected"].get("distractors",[]))
    return pools

def choose_distractors(answer, values):
    out=[]
    for value in values:
        value=str(value)
        if value.casefold()!=str(answer).casefold() and value.casefold() not in {x.casefold() for x in out}: out.append(value)
        if len(out)==3: return out
    raise ValueError(f"insufficient trusted distractors for {answer}")

def historical(rows):
    pools=trusted_pool(rows)
    result=[]
    for source in rows:
        task=kind(source); payload=fact(source,task); content=source["content"]
        if source["language"]=="ar" and source["subject"]=="MATH":
            for en,ar in AR.items(): content=re.sub(rf"\b{en}\b",ar,content,flags=re.I)
        distractors=choose_distractors(source["source_expected"]["answer"],pools[(source["language"],task)])
        if payload and payload.get("operation")=="recognition": payload["allowed_distractors"]=distractors
        answer=source["source_expected"]["answer"]
        explanation=f"الإجابة الصحيحة هي {answer}." if source["language"]=="ar" else f"The verified answer is {answer}."
        result.append(make_row(source,"train",source["curriculum_unit_id"]+"-v063",task,content,source["topic"],answer,distractors,explanation,payload))
    return result

def new_units(split):
    banks={"validation":[("ADDITION",15,3,"garden"),("SUBTRACTION",18,5,"kitchen"),("MISSING_NUMBER",9,17,"desk"),("SEQUENCE",4,7,"library"),("COMPARISON",19,12,"park"),("ADDITION",16,6,"class"),("SUBTRACTION",21,8,"home"),("MISSING_NUMBER",11,20,"shop"),("SEQUENCE",6,10,"yard"),("COMPARISON",23,14,"garden"),("ADDITION",22,7,"kitchen"),("SUBTRACTION",25,9,"desk"),("MISSING_NUMBER",13,24,"library"),("SEQUENCE",8,13,"park"),("COMPARISON",27,16,"class")],"test":[("ADDITION",31,8,"museum"),("SUBTRACTION",34,11,"station"),("MISSING_NUMBER",14,29,"balcony"),("SEQUENCE",9,15,"market"),("COMPARISON",32,18,"farm"),("ADDITION",36,9,"river"),("SUBTRACTION",39,12,"museum"),("MISSING_NUMBER",17,35,"station"),("SEQUENCE",11,19,"balcony"),("COMPARISON",38,21,"market"),("ADDITION",41,10,"farm"),("SUBTRACTION",43,14,"river"),("MISSING_NUMBER",19,40,"museum"),("SEQUENCE",13,22,"station"),("COMPARISON",45,24,"balcony")]}
    result=[]; tag="v" if split=="validation" else "h"
    for i,(task,a,b,ctx) in enumerate(banks[split]):
        level=i//5+1; answer=a+b if task=="ADDITION" else a-b if task=="SUBTRACTION" else b-a if task=="MISSING_NUMBER" else b+2*(b-a) if task=="SEQUENCE" else max(a,b); third=b+(b-a); operation={"ADDITION":"add","SUBTRACTION":"subtract","MISSING_NUMBER":"missing_add","SEQUENCE":"arithmetic_sequence","COMPARISON":"compare"}[task]; payload={"task_type":task,"operation":operation}
        if task in {"ADDITION","SUBTRACTION"}: payload.update(operand_1=a,operand_2=b,answer=answer)
        elif task=="MISSING_NUMBER": payload.update(known=a,total=b,answer=answer)
        elif task=="SEQUENCE": payload.update(sequence=[a,b,third],difference=b-a,answer=answer)
        else: payload.update(left=a,right=b,relation="greater" if a>b else "less",answer=str(answer))
        for language in ("en","ar"):
            content=f"A learner studies {a} and {b} at the {ctx}." if language=="en" else f"يدرس المتعلم العددين {a} و{b} في {AR[ctx]}."; topic=task.title() if language=="en" else "درس رياضيات"; ex=f"The verified answer is {answer}." if language=="en" else f"الإجابة الصحيحة هي {answer}."; ds=[max(0,answer-1),answer+1,answer+2]
            result.append(make_row({"language":language,"level":level,"subject":"MATH","skill_family":"MATH_"+task,"template_family":"MATH_"+task+"_PLANNER"},split,f"v063-{tag}-math-{i+1:02d}",task,content,topic,answer,ds,ex,payload))
    lang_bank={"validation":[("pencil","قلم","WORD_RECOGNITION","desk"),("runs","يركض","ACTION_WORD","yard"),("a tool for writing","أداة للكتابة","WORD_MEANING","class"),("a child finds a pencil","يجد طفل قلما","SHORT_READING","library"),("the learner opens the notebook","يفتح المتعلم الدفتر","BASIC_INFERENCE","home")],"test":[("apple","تفاحة","WORD_RECOGNITION","kitchen"),("claps","يصفق","ACTION_WORD","museum"),("a fruit","فاكهة","WORD_MEANING","market"),("a child washes an apple","يغسل طفل تفاحة","SHORT_READING","balcony"),("the learner shares the fruit","يشارك المتعلم الفاكهة","BASIC_INFERENCE","farm")]}
    for i in range(15):
        answer_en,answer_ar,task,ctx=lang_bank[split][i%5]; level=i//5+1
        for language in ("en","ar"):
            answer=answer_en if language=="en" else answer_ar; content=f"A learner studies the word {answer_en} at the {ctx}." if language=="en" else f"يدرس المتعلم الكلمة {answer_ar} في {AR[ctx]}."; topic=task.title() if language=="en" else "درس لغوي"; ds_en=[["eraser","chair","window"],["sits","reads","sleeps"],["a color","a number","a place"],["a child closes a book","a teacher sleeps","a bell rings"],["the learner leaves","the learner forgets","the learner hides"]][i%5]; ds_ar=[["ممحاة","كرسي","نافذة"],["يجلس","يقرأ","ينام"],["لون","عدد","مكان"],["يغلق طفل كتابا","ينام معلم","يرن جرس"],["يغادر المتعلم","ينسى المتعلم","يخفي المتعلم"]][i%5]; ds=ds_en if language=="en" else ds_ar; ex=f"The lesson uses {answer_en}." if language=="en" else f"يستخدم الدرس كلمة {answer_ar}."; payload=None
            result.append(make_row({"language":language,"level":level,"subject":"LANGUAGE","skill_family":"LANGUAGE_"+task,"template_family":"LANGUAGE_"+task+"_PLANNER"},split,f"v063-{tag}-language-{i+1:02d}",task,content,topic,answer,ds,ex,payload))
    return result

def main():
    source=[json.loads(x) for x in SOURCE.read_text(encoding="utf-8").splitlines() if x.strip()]; rows=historical(source)+new_units("validation")+new_units("test"); OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"master_v063.jsonl").write_text("".join(json.dumps(x,ensure_ascii=False)+"\n" for x in rows),encoding="utf-8")
    manifest={"version":"v0.6.3","counts":{s:sum(x["split"]==s for x in rows) for s in ("train","validation","test")},"historical_training_pool":"v0.5 frozen conditions transformed to planner objective","new_validation_units":15,"new_hidden_test_units":15}
    (OUT/"split_manifest_v063.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8"); print(json.dumps(manifest,ensure_ascii=False,indent=2))
if __name__=="__main__": main()
