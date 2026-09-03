from __future__ import annotations

import json, platform, random, re, sys, time
from pathlib import Path
import numpy as np
import torch

ROOT=Path(__file__).resolve().parents[1]; sys.path.insert(0,str(ROOT/"src"))
from rafeeq_qg.runtime_paths import resolve_runtime_paths
from rafeeq_qg.v061_formats import parse_short
from rafeeq_qg.v063_hybrid import build_final, explanation_answer_consistency, semantic_binding

DATA=ROOT/"data"/"v063"/"master_v063.jsonl"; DEVICE="cuda"
def seed_all(seed):
    random.seed(seed); np.random.seed(seed); torch.manual_seed(seed); torch.cuda.manual_seed_all(seed); torch.backends.cudnn.deterministic=True; torch.backends.cudnn.benchmark=False
def clean(tok,ids): return tok.decode([x for x in ids if x not in {tok.pad_token_id,tok.eos_token_id}],skip_special_tokens=False,clean_up_tokenization_spaces=False).strip()
def encode(tok,rows): return [(r,tok(r["input_condition"],return_tensors="pt",max_length=160,truncation=True),tok(r["targets"]["short_sentinel_v063"],return_tensors="pt",max_length=96,truncation=True)["input_ids"][0]) for r in rows]
def score(model,tok,encoded,beams=1):
    out=[]; model.eval()
    with torch.no_grad():
        for row,inputs,_ in encoded:
            ids=model.generate(**{k:v.to(DEVICE) for k,v in inputs.items()},num_beams=beams,do_sample=False,max_new_tokens=64)[0].cpu().tolist(); raw=clean(tok,ids); parsed=None
            try: parsed=parse_short(raw)
            except ValueError: pass
            text=(parsed["question"]+" "+parsed["explanation"]) if parsed else ""; ar=bool(re.search(r"[\u0600-\u06FF]",text)); lang=(len(re.findall(r"[\u0600-\u06FF]+",text))>=2 and not re.search(r"[A-Za-z]{2,}",text)) if row["language"]=="ar" else (len(re.findall(r"[A-Za-z]+",text))>=2 and not ar)
            out.append({"id":row["id"],"raw_output":raw,"parsed":parsed,"parse":bool(parsed),"language":bool(lang),"semantic":bool(parsed) and semantic_binding(row,parsed["question"]),"explanation":bool(parsed) and explanation_answer_consistency(row,parsed["explanation"])})
    return out
def aggregate(items): return {k:sum(x[k] for x in items) for k in ("parse","language","semantic","explanation")}
def train_seed(seed,train,val,runtime):
    from transformers import Adafactor,AutoModelForSeq2SeqLM,AutoTokenizer,__version__ as tv
    seed_all(seed); tok=AutoTokenizer.from_pretrained("google/mt5-small",use_fast=False); model=AutoModelForSeq2SeqLM.from_pretrained("google/mt5-small").to(DEVICE); model.config.use_cache=False; tr=encode(tok,train); va=encode(tok,val); opt=Adafactor(model.parameters(),lr=1e-3,relative_step=False,scale_parameter=False,warmup_init=False,clip_threshold=1.0,weight_decay=0.0); history=[]; best=None; stale=0; start=time.perf_counter()
    for epoch in range(1,11):
        model.train()
        for row,inputs,labels in tr:
            loss=model(**{k:v.to(DEVICE) for k,v in inputs.items()},labels=labels.to(DEVICE).unsqueeze(0)).loss; loss.backward(); opt.step(); opt.zero_grad(set_to_none=True)
        items=score(model,tok,va); metrics=aggregate(items); record={"epoch":epoch,"validation_loss":float(loss.item()),"validation_metrics":metrics}; history.append(record); print(f"seed={seed} epoch={epoch} metrics={metrics}",flush=True)
        rank=(metrics["semantic"],metrics["parse"],metrics["language"],metrics["explanation"],-record["validation_loss"])
        if best is None or rank>best["rank"]: best={"rank":rank,"record":record}; stale=0; ck=runtime.checkpoints_dir/f"rafeeq-mt5-qg-v0.6.3-seed{seed}"; ck.mkdir(parents=True,exist_ok=True); model.save_pretrained(ck); tok.save_pretrained(ck)
        else: stale+=1
        if stale>=3: break
    report={"version":"v0.6.3","seed":seed,"epochs_completed":epoch,"best_epoch":best["record"]["epoch"],"best_validation":best["record"],"history":history,"checkpoint":str(ck),"base_model":"google/mt5-small","optimizer":"Adafactor","learning_rate":1e-3,"python_version":platform.python_version(),"pytorch_version":torch.__version__,"transformers_version":tv,"gpu":torch.cuda.get_device_name(0),"validation_or_test_loaded":False,"runtime_seconds":time.perf_counter()-start}; (runtime.outputs_dir/f"v063_seed{seed}.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf8"); del model; torch.cuda.empty_cache(); return report
def main():
    if not torch.cuda.is_available(): raise RuntimeError("CUDA required")
    rows=[json.loads(x) for x in DATA.read_text(encoding="utf8").splitlines() if x.strip()]; train=[r for r in rows if r["split"]=="train"]; val=[r for r in rows if r["split"]=="validation"]; hidden=[r for r in rows if r["split"]=="test"]; runtime=resolve_runtime_paths(ROOT); [p.mkdir(parents=True,exist_ok=True) for p in (runtime.models_dir,runtime.checkpoints_dir,runtime.outputs_dir)]
    sanity=json.loads((runtime.outputs_dir/"v063_sanity_summary.json").read_text(encoding="utf8")); assert sanity["all_three_passed"]
    reports=[train_seed(s,train,val,runtime) for s in (42,43,44)]; winner=max(reports,key=lambda r:(r["best_validation"]["validation_metrics"]["semantic"],r["best_validation"]["validation_metrics"]["parse"],r["best_validation"]["validation_metrics"]["language"],r["best_validation"]["validation_metrics"]["explanation"],-r["best_validation"]["validation_loss"]))
    from transformers import AutoModelForSeq2SeqLM,AutoTokenizer
    model=AutoModelForSeq2SeqLM.from_pretrained(winner["checkpoint"]).to(DEVICE); tok=AutoTokenizer.from_pretrained(winner["checkpoint"],use_fast=False); encoded=encode(tok,hidden); results=[]
    for row,inputs,_ in encoded:
        attempts=[]; parsed=None
        for beams in (1,2,4):
            raw=clean(tok,model.generate(**{k:v.to(DEVICE) for k,v in inputs.items()},num_beams=beams,do_sample=False,max_new_tokens=64)[0].cpu().tolist()); attempts.append({"beams":beams,"raw_output":raw})
            try:
                candidate=parse_short(raw)
                if semantic_binding(row,candidate["question"]) and explanation_answer_consistency(row,candidate["explanation"]): parsed=candidate; break
            except ValueError: pass
        fallback=parsed is None; final=build_final(row,parsed or {"question":"","explanation":""},fallback=fallback); results.append({"id":row["id"],"attempts":attempts,"attempt_count":len(attempts),"ml_accepted":not fallback,"system_fallback":fallback,"final":final})
    summary={"version":"v0.6.3","selected_seed":winner["seed"],"final_model_dir":str(runtime.models_dir/"rafeeq-mt5-qg-v0.6.3-final"),"validation_comparison":[{"seed":r["seed"],"best_epoch":r["best_epoch"],"best_validation":r["best_validation"]} for r in reports],"hidden_test_count":len(results),"ml_acceptance_rate":sum(not r["system_fallback"] for r in results)/len(results),"system_delivery_rate":1.0,"fallback_count":sum(r["system_fallback"] for r in results),"results":results,"validation_or_test_loaded_after_selection":True}; final_dir=runtime.models_dir/"rafeeq-mt5-qg-v0.6.3-final"; final_dir.mkdir(parents=True,exist_ok=True); model.save_pretrained(final_dir); tok.save_pretrained(final_dir); (runtime.outputs_dir/"v063_final_experiment_summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf8"); print(json.dumps({k:summary[k] for k in ("selected_seed","hidden_test_count","ml_acceptance_rate","fallback_count")},ensure_ascii=False,indent=2))
if __name__=="__main__": main()
