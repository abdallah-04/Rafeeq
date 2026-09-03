from __future__ import annotations

import hashlib, re

AR_CONTEXT={"museum":"المتحف","station":"المحطة","balcony":"الشرفة","market":"السوق","farm":"المزرعة","river":"النهر","garden":"الحديقة","kitchen":"المطبخ","library":"المكتبة","class":"الصف","home":"المنزل","park":"الحديقة العامة","desk":"المكتب","yard":"الساحة","shop":"المتجر"}
STYLES={1:"direct",2:"simple_verbal",3:"short_contextual"}
def normalize_digits(text): return text.translate(str.maketrans("٠١٢٣٤٥٦٧٨٩","0123456789"))
def style_for(level): return STYLES[int(level)]
def plan(row):
    f=row.get("fact_payload") or {}; task=row["task_type"]; p={"task":"generate_question","unit_id":row.get("curriculum_unit_id",""),"language":row["language"],"level":row["level"],"subject":row["subject"],"task_type":task,"style":style_for(row["level"])}
    if row["subject"]=="MATH":
        p.update({"operation":f.get("operation"),"question_goal":{"ADDITION":"result","SUBTRACTION":"result","MISSING_NUMBER":"missing_operand","SEQUENCE":"next_value","COMPARISON":"greater_value"}.get(task,"identify_stimulus")})
        for k in ("operand_1","operand_2","known","total","left","right","sequence","correct_value"): 
            if k in f: p[k]=f[k]
        return p
    cue=row.get("semantic_cue",""); p.update({"question_goal":row.get("question_goal","choose_matching_answer"),"cue":cue})
    if row.get("stimulus"): p["stimulus"]=row["stimulus"]
    if row.get("passage"): p["passage"]=row["passage"]
    if row.get("context"): p["context"]=row["context"]
    return p
def plan_text(row):
    p=plan(row); lines=[f"{k}={v}" for k,v in p.items()]; return "\n".join(lines)
def question(row):
    f=row.get("fact_payload") or {}; task=row["task_type"]; ar=row["language"]=="ar"; level=row["level"]
    if task=="ADDITION": return (f"What is {f['operand_1']} + {f['operand_2']}?" if level==1 else f"What do you get when you add {f['operand_1']} and {f['operand_2']}?" if level==2 else f"A child has {f['operand_1']} items and gets {f['operand_2']} more. How many items are there now?") if not ar else (f"ما ناتج {f['operand_1']} + {f['operand_2']}؟" if level==1 else f"كم يصبح العدد عند جمع {f['operand_1']} و{f['operand_2']}؟" if level==2 else f"لدى طفل {f['operand_1']} أشياء وأضيفت إليه {f['operand_2']} أخرى. كم شيئا لديه الآن؟")
    if task=="SUBTRACTION": return (f"What is {f['operand_1']} - {f['operand_2']}?" if level==1 else f"What do you get when you take {f['operand_2']} away from {f['operand_1']}?" if level==2 else f"A child has {f['operand_1']} items and gives away {f['operand_2']}. How many remain?") if not ar else (f"ما ناتج {f['operand_1']} - {f['operand_2']}؟" if level==1 else f"كم يبقى عند طرح {f['operand_2']} من {f['operand_1']}؟" if level==2 else f"لدى طفل {f['operand_1']} أشياء وأعطى {f['operand_2']}. كم بقي؟")
    if task=="MISSING_NUMBER": return (f"What number completes {f['known']} + ? = {f['total']}?" if level<3 else f"A number is missing: {f['known']} plus what makes {f['total']}?") if not ar else (f"ما العدد المفقود في {f['known']} + ؟ = {f['total']}؟" if level<3 else f"ما العدد الذي نضيفه إلى {f['known']} لنحصل على {f['total']}؟")
    if task=="SEQUENCE": return (f"What comes next: {', '.join(map(str,f['sequence']))}?" if level<3 else f"The pattern is {', '.join(map(str,f['sequence']))}. What number comes next?") if not ar else (f"ما العدد التالي: {'، '.join(map(str,f['sequence']))}؟" if level<3 else f"النمط هو {'، '.join(map(str,f['sequence']))}. ما العدد التالي؟")
    if task=="COMPARISON": return (f"Which number is greater, {f['left']} or {f['right']}?" if level<3 else f"Look at {f['left']} and {f['right']}. Which number is greater?") if not ar else (f"أي العددين أكبر: {f['left']} أم {f['right']}؟" if level<3 else f"قارن بين العددين {f['left']} و{f['right']}. أيهما أكبر؟")
    if task in {"NUMBER_RECOGNITION","COUNTING"}: return "Which number does the lesson show?" if not ar else "أي عدد يوضحه الدرس؟"
    if task=="SHAPE_RECOGNITION": return "Which shape does the lesson show?" if not ar else "أي شكل يوضحه الدرس؟"
    if task=="WORD_MEANING": return f'What does the word "{row["stimulus"]}" mean?' if not ar else f"ماذا تعني كلمة «{row['stimulus']}»؟"
    if task=="WORD_RECOGNITION": return "Which word names a fruit?" if not ar else "أي كلمة تدل على فاكهة؟"
    if task=="ACTION_WORD": return "Which word describes what the child is doing?" if not ar else "أي كلمة تصف ما يفعله الطفل؟"
    if task=="SHORT_READING": return "Which object is mentioned in the passage?" if not ar else "أي شيء ذُكر في الفقرة؟"
    if task=="BASIC_INFERENCE": return "What can we infer from the scene?" if not ar else "ماذا نستنتج من المشهد؟"
    return "Which answer fits the lesson?" if not ar else "أي إجابة تناسب الدرس؟"
def semantic_binding(row,text):
    q=normalize_digits(text).casefold(); f=row.get("fact_payload") or {}; task=row["task_type"]
    if task in {"ADDITION","SUBTRACTION"}: return all(str(f[k]) in q for k in ("operand_1","operand_2")) and ((task=="ADDITION" and any(x in q for x in ("+","add","gets","more","جمع","ناتج","أضيفت"))) or (task=="SUBTRACTION" and any(x in q for x in ("-","take","take away","gives away","remain","طرح","ناقص","بقي"))))
    if task=="MISSING_NUMBER": return str(f["known"]) in q and str(f["total"]) in q and ("?" in q or "؟" in q or "missing" in q or "مفقود" in q)
    if task=="SEQUENCE": return all(str(x) in q for x in f["sequence"]) and any(x in q for x in ("next","pattern","التالي","النمط"))
    if task=="COMPARISON": return all(str(f[k]) in q for k in ("left","right")) and any(x in q for x in ("greater","compare","أكبر","قارن"))
    if task in {"NUMBER_RECOGNITION","COUNTING","SHAPE_RECOGNITION"}: return any(x in q for x in ("number","shape","عدد","شكل"))
    cues={"WORD_RECOGNITION":("fruit","فاكهة","كلمة"),"ACTION_WORD":("movement","action","حركة","كلمة"),"WORD_MEANING":("meaning","word","تعني","كلمة"),"SHORT_READING":("object","passage","شيء","فقرة"),"BASIC_INFERENCE":("infer","scene","نستنتج","مشهد"),"LETTER_RECOGNITION":("letter","حرف"),"CONTEXT_SELECTION":("context","سياق")}.get(task,())
    return bool(q.strip()) and any(token in q for token in cues)
def level_style(row,text):
    n=len(text.split()); contextual=bool(re.search(r"\b(child|has|gets|gives|remain|طفل|لدى|أضيفت|أعطى)\b",text.casefold())); expected={1:n<=12 and not contextual,2:n<=18,3:contextual or n>=12}[row["level"]]; return {"token_length":n,"contextual_structure":contextual,"complexity":"direct" if not contextual else "contextual","compatible":expected}
def deterministic_explanation(row):
    f=row.get("fact_payload") or {}; a=str(row["source_expected"]["answer"]); ar=row["language"]=="ar"
    if row["subject"]=="MATH" and f.get("operation")=="add": s=f"{f['operand_1']} + {f['operand_2']} = {a}"
    elif row["subject"]=="MATH" and f.get("operation")=="subtract": s=f"{f['operand_1']} - {f['operand_2']} = {a}"
    else: s=f"The verified curriculum relation gives {a}" if not ar else f"العلاقة التعليمية الموثقة تعطي {a}"
    return s+("، لذلك الإجابة الصحيحة هي " if ar else ", so the correct answer is ")+a+"."
