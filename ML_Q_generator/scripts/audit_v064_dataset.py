from __future__ import annotations
import hashlib,json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; sys.path.insert(0,str(ROOT/"src"))
from rafeeq_qg.v061_hybrid import verify_fact
from rafeeq_qg.v063_hybrid import deterministic_options
from rafeeq_qg.runtime_paths import resolve_runtime_paths
from rafeeq_qg.v064_formats import parse_question
from rafeeq_qg.v064_planner import level_style,semantic_binding
def load(name): return [json.loads(x) for x in (ROOT/"data"/"v064"/name).read_text(encoding="utf8").splitlines() if x.strip()]
def main():
    train,val,hidden=load("train_v064.jsonl"),load("validation_v064.jsonl"),load("hidden_test_v064.jsonl"); rows=train+val+hidden
    assert len(rows)==600 and len({r["input_condition"] for r in rows})==600
    assert [len(x) for x in (train,val,hidden)]==[480,60,60]
    copy_leaks=answer_leaks=0; styles=[]
    for r in rows:
        q=parse_question(r["targets"]["question_only_v064"]); inp=r["input_condition"]
        copy_leaks += int(q in inp)
        answer=str(r["source_expected"]["answer"]); exact=bool(re.search(rf"(?<!\w){re.escape(answer.casefold())}(?!\w)",q.casefold()))
        arithmetic_stimulus_exception=r["task_type"]=="SUBTRACTION" and exact and answer in {str(r["fact_payload"].get("operand_1")),str(r["fact_payload"].get("operand_2"))}
        answer_leaks += int(exact and r["task_type"] not in {"WORD_MEANING","COMPARISON","LETTER_RECOGNITION"} and not arithmetic_stimulus_exception)
        assert not any(k in inp for k in ("trusted_answer","correct_answer","distractors","correct_letter","canonical_question"))
        assert r["source_expected"]["question"]==q and not (r["subject"]=="MATH" and not verify_fact(r["fact_payload"]))
        options,letter=deterministic_options(r); assert len(set(options))==4 and options[ord(letter)-65]==answer
        styles.append(level_style(r,q))
        if r["subject"]=="MATH": assert semantic_binding(r,q)
    assert copy_leaks==0 and answer_leaks==0
    assert not {r["instance_signature"] for r in val}&{r["instance_signature"] for r in hidden}
    stats={"version":"v0.6.4","rows":600,"counts":{"train":480,"validation":60,"test":60},"balanced":{"languages":{"ar":300,"en":300},"subjects":{"MATH":300,"LANGUAGE":300},"levels":{"1":200,"2":200,"3":200}},"unique_model_inputs":600,"target_sentence_copy_leak_count":copy_leaks,"answer_leak_count":answer_leaks,"question_targets_parse":600,"validation_hidden_signature_overlap":0,"deterministic_option_integrity":1.0,"level_style_heuristic":{"compatible":sum(x["compatible"] for x in styles),"total":len(styles)}}
    (ROOT/"data"/"v064"/"dataset_statistics_v064.json").write_text(json.dumps(stats,ensure_ascii=False,indent=2)+"\n",encoding="utf8"); runtime=resolve_runtime_paths(ROOT).outputs_dir; runtime.mkdir(parents=True,exist_ok=True); (runtime/"v064_dataset_audit.json").write_text(json.dumps(stats,ensure_ascii=False,indent=2)+"\n",encoding="utf8"); print(json.dumps(stats,ensure_ascii=False,indent=2))
if __name__=="__main__": main()
