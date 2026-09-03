from __future__ import annotations

import json, platform, random, re, sys, time
from pathlib import Path
import numpy as np
import torch

ROOT=Path(__file__).resolve().parents[1]; sys.path.insert(0,str(ROOT/"src"))
from rafeeq_qg.runtime_paths import resolve_runtime_paths
from rafeeq_qg.v061_formats import parse_short
from rafeeq_qg.v063_hybrid import explanation_answer_consistency, semantic_binding

DATA=ROOT/"data"/"v063"/"master_v063.jsonl"

def seed_all(seed):
    random.seed(seed); np.random.seed(seed); torch.manual_seed(seed)
    if torch.cuda.is_available(): torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic=True; torch.backends.cudnn.benchmark=False

def rows_for_sanity():
    rows=[json.loads(x) for x in DATA.read_text(encoding="utf8").splitlines() if x.strip()]; selected=[]
    for language in ("ar","en"):
        for subject in ("MATH","LANGUAGE"):
            for level in (1,2,3): selected.extend([r for r in rows if r["split"]=="train" and r["language"]==language and r["subject"]==subject and r["level"]==level][:2])
    assert len(selected)==24 and len({r["input_condition"] for r in selected})==24; return selected

def clean_decode(tokenizer, ids):
    return tokenizer.decode([x for x in ids if x not in {tokenizer.pad_token_id,tokenizer.eos_token_id}],skip_special_tokens=False,clean_up_tokenization_spaces=False).strip()

def evaluate(model,tokenizer,rows,encoded,step):
    model.eval(); metrics={"strict_parse":0,"language_pass":0,"semantic_binding":0,"explanation_consistency":0,"outputs":[]}
    with torch.no_grad():
        for row,(inputs,_) in zip(rows,encoded):
            raw=clean_decode(tokenizer,model.generate(**{k:v.to(model.device) for k,v in inputs.items()},do_sample=False,max_new_tokens=64)[0].cpu().tolist()); parsed=None
            try: parsed=parse_short(raw); metrics["strict_parse"]+=1
            except ValueError: pass
            text=(parsed["question"]+" "+parsed["explanation"]) if parsed else ""; ar=bool(re.search(r"[\u0600-\u06FF]",text)); lang=(len(re.findall(r"[\u0600-\u06FF]+",text))>=2 and not re.search(r"[A-Za-z]{2,}",text)) if row["language"]=="ar" else (len(re.findall(r"[A-Za-z]+",text))>=2 and not ar)
            sem=bool(parsed) and semantic_binding(row,parsed["question"]); exp=bool(parsed) and explanation_answer_consistency(row,parsed["explanation"])
            metrics["language_pass"]+=int(lang); metrics["semantic_binding"]+=int(sem); metrics["explanation_consistency"]+=int(exp); metrics["outputs"].append({"id":row["id"],"raw_output":raw,"parsed":parsed,"language_pass":lang,"semantic_binding":sem,"explanation_consistency":exp})
    metrics["step"]=step; return metrics

def run(seed,rows,runtime):
    from transformers import Adafactor,AutoModelForSeq2SeqLM,AutoTokenizer,__version__ as transformers_version
    seed_all(seed); tokenizer=AutoTokenizer.from_pretrained("google/mt5-small",use_fast=False); model=AutoModelForSeq2SeqLM.from_pretrained("google/mt5-small").to("cuda"); model.config.use_cache=False
    encoded=[(tokenizer(r["input_condition"],return_tensors="pt",max_length=160,truncation=True),tokenizer(r["targets"]["short_sentinel_v063"],return_tensors="pt",max_length=96,truncation=True)["input_ids"][0]) for r in rows]
    optimizer=Adafactor(model.parameters(),lr=1e-3,relative_step=False,scale_parameter=False,warmup_init=False,clip_threshold=1.0,weight_decay=0.0); history=[]; started=time.perf_counter()
    for step in range(1,1201):
        inputs,labels=encoded[(step-1)%24]; loss=model(**{k:v.to("cuda") for k,v in inputs.items()},labels=labels.to("cuda").unsqueeze(0)).loss; loss.backward(); optimizer.step(); optimizer.zero_grad(set_to_none=True)
        if step%200==0:
            m=evaluate(model,tokenizer,rows,encoded,step); m["training_loss"]=float(loss.item()); history.append(m); print(f"seed={seed} step={step} parse={m['strict_parse']}/24 lang={m['language_pass']}/24 sem={m['semantic_binding']}/24 exp={m['explanation_consistency']}/24",flush=True)
            if all(m[k]>=22 for k in ("strict_parse","language_pass","semantic_binding","explanation_consistency")) and len(history)>=2: break
    final=history[-1]; report={"version":"v0.6.3","seed":seed,"conditions":24,"max_steps":1200,"steps_completed":final["step"],"base_model":"google/mt5-small","optimizer":"Adafactor","learning_rate":1e-3,"python_version":platform.python_version(),"pytorch_version":torch.__version__,"transformers_version":transformers_version,"cuda_version":torch.version.cuda,"gpu":torch.cuda.get_device_name(0),"cudnn_deterministic":torch.backends.cudnn.deterministic,"cudnn_benchmark":torch.backends.cudnn.benchmark,"history":history,"final":final,"pass_gate":all(final[k]>=22 for k in ("strict_parse","language_pass","semantic_binding","explanation_consistency")),"runtime_seconds":time.perf_counter()-started,"validation_or_test_loaded":False}
    (runtime/f"v063_sanity_seed{seed}.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf8"); del model; torch.cuda.empty_cache(); return report

def main():
    if not torch.cuda.is_available(): raise RuntimeError("CUDA required for v0.6.3 sanity")
    rows=rows_for_sanity(); runtime=resolve_runtime_paths(ROOT).outputs_dir; runtime.mkdir(parents=True,exist_ok=True); reports=[run(seed,rows,runtime) for seed in (42,43,44)]
    summary={"version":"v0.6.3","seeds":[{"seed":r["seed"],"steps_completed":r["steps_completed"],"metrics":{k:r["final"][k] for k in ("strict_parse","language_pass","semantic_binding","explanation_consistency")},"pass_gate":r["pass_gate"]} for r in reports],"all_three_passed":all(r["pass_gate"] for r in reports),"full_training_allowed":all(r["pass_gate"] for r in reports)}
    (runtime/"v063_sanity_summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf8"); print(json.dumps(summary,ensure_ascii=False,indent=2))
    if not summary["all_three_passed"]: raise SystemExit("v0.6.3 sanity gate failed; full training must not run")
if __name__=="__main__": main()
