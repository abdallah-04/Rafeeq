from __future__ import annotations
import re
from .v064_planner import normalize_digits,style_for
def plan(row):
    f=dict(row.get("fact_payload") or {}); task=row["task_type"]; p={"task":"generate_question","language":row["language"],"level":row["level"],"subject":row["subject"],"task_type":task,"style":style_for(row["level"])}
    if row.get("stimulus_fingerprint"):p["stimulus_fingerprint"]=row["stimulus_fingerprint"]
    if row["subject"]=="MATH":
        if task=="NUMBER_RECOGNITION": p.update(shown_numeral=f.get("shown_numeral"),question_goal="identify_number"); return p
        if task=="SHAPE_RECOGNITION":
            p.update(shape_properties=f.get("shape_properties","visual_shape_features"),question_goal="identify_shape"); return p
        if task=="COUNTING":
            nums=[int(x) for x in re.findall(r"\d+",str(f.get("stimulus",row.get("content",""))))]; nums=nums[:3]
            if len(nums)>=3: p.update(operation="quantity_change",start_count=nums[0],removed_count=nums[1],added_count=nums[2],question_goal="final_count")
            else: p.update(operation="quantity_change",question_goal="final_count",structured_parse_status="UNPARSED_REQUIRES_REVIEW")
            return p
        p.update(operation=f.get("operation"),question_goal={"ADDITION":"result","SUBTRACTION":"result","MISSING_NUMBER":"missing_operand","SEQUENCE":"next_value","COMPARISON":"greater_value"}.get(task,"identify_stimulus"))
        for k in ("operand_1","operand_2","known","total","left","right","sequence"): 
            if k in f:p[k]=f[k]
        return p
    p.update(question_goal=row.get("question_goal","choose_matching_answer"),semantic_cue=row.get("semantic_cue","lesson concept"))
    if row.get("stimulus_context"):p["stimulus_context"]=row["stimulus_context"]
    if row.get("stimulus_fingerprint"):p["stimulus_fingerprint"]=row["stimulus_fingerprint"]
    if row.get("stimulus"):p["stimulus_word"]=row["stimulus"]
    if row.get("passage"):p["passage"]=row["passage"]
    if task=="CONTEXT_SELECTION":p.update(stimulus_sentence=row.get("stimulus_sentence",""),question_goal="choose_ending_punctuation")
    return p
def plan_text(row): return "\n".join(f"{k}={v}" for k,v in plan(row).items())
def question(row):
    f=row.get("fact_payload") or {}; task=row["task_type"]; ar=row["language"]=="ar"; lev=row["level"]
    if task=="COUNTING" and len(re.findall(r"\d+",str(f.get("stimulus",row.get("content","")))))>=3:
        n=re.findall(r"\d+",str(f.get("stimulus",row.get("content",""))))[:3]; return (f"A child had {n[0]} items, gave away {n[1]}, and then got {n[2]} more. How many items does the child have now?" if not ar else f"كان مع طفل {n[0]} أشياء، أعطى {n[1]} منها، ثم حصل على {n[2]} إضافية. كم أصبح لديه الآن؟")
    if task=="SHORT_READING" and lev==3:return "Sara put something in her bag before school. What did she put in the bag?" if not ar else "وضعت سارة شيئًا في حقيبتها قبل المدرسة. ماذا وضعت في الحقيبة؟"
    if task=="CONTEXT_SELECTION":return "A child writes \"I went home\". Which punctuation mark should come at the end of the sentence?" if not ar else "كتب الطفل «ذهبت إلى البيت». ما علامة الترقيم المناسبة في نهاية الجملة؟"
    if task=="ACTION_WORD":return "Which word describes what the child is doing?" if not ar else "أي كلمة تصف ما يفعله الطفل؟"
    from .v064_planner import question as old_question
    return old_question(row)
def semantic_binding(row,text):
    q=normalize_digits(text).casefold();f=row.get("fact_payload") or {};task=row["task_type"]
    if task=="ACTION_WORD":return any(x in q for x in ("action","movement","doing","does","describes","word describes","حركة","يفعل","يفعله","تصف","يصف","ما يفعله"))
    if task=="CONTEXT_SELECTION":return any(x in q for x in ("punctuation","mark","end","finish","sentence","ترقيم","علامة","نهاية","تنتهي","الجملة"))
    if task=="COUNTING":return all(str(x) in q for x in re.findall(r"\d+",str(f.get("stimulus",row.get("content",""))))[:3]) and any(x in q for x in ("how many","final","now","كم","أصبح"))
    if task=="SHORT_READING":return any(x in q for x in ("object","put","bag","what did","شيء","وضعت","حقيبة","ماذا"))
    from .v064_planner import semantic_binding as old
    return old(row,text)
def level_style(row,text):
    n=len(text.split());q=text.casefold(); strong=any(x in q for x in ("child","learner","sara","scene","passage","sentence","writes","before","after","has","gets","gives","look at","طفل","المتعلم","سارة","مشهد","فقرة","جملة","كتب","قبل","بعد","لدى","حصل","أعطى","انظر")); weak=any(x in q for x in ("pattern","missing","clue","lesson","read","نمط","مفقود","الدليل","الدرس","اقرأ","قارن")); contextual=strong or (row["level"]==3 and weak)
    if row["task_type"] in {"SHORT_READING","CONTEXT_SELECTION"} and row["level"]==3:contextual=True
    if row["level"]==1: contextual=False
    return {"token_length":n,"contextual_structure":contextual,"complexity":"contextual" if contextual else "direct","compatible":(n<=12 and not contextual) if row["level"]==1 else (n<=22) if row["level"]==2 else contextual}
def explanation(row):
    f=row.get("fact_payload") or {};a=str(row["source_expected"]["answer"]);ar=row["language"]=="ar"
    if row["task_type"]=="COUNTING":
        n=re.findall(r"\d+",str(f.get("stimulus",row.get("content",""))))[:3];s=f"{n[0]} - {n[1]} + {n[2]} = {a}" if len(n)>=3 else a
    elif f.get("operation")=="add":s=f"{f['operand_1']} + {f['operand_2']} = {a}"
    elif f.get("operation")=="subtract":s=f"{f['operand_1']} - {f['operand_2']} = {a}"
    else:s=a
    return (s+"، لذلك الإجابة الصحيحة هي "+a+".") if ar else (s+", so the correct answer is "+a+".")
