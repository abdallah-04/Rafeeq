from __future__ import annotations
import hashlib,json,platform,random,re,sys,time
from pathlib import Path
import numpy as np,torch
from torch.utils.data import DataLoader
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/"src"))
from rafeeq_qg.runtime_paths import resolve_runtime_paths
from rafeeq_qg.v064_formats import parse_question
from rafeeq_qg.v064_planner import level_style,semantic_binding
DATA=ROOT/"data"/"v064"/"train_v064.jsonl"
def seed_all(s): random.seed(s);np.random.seed(s);torch.manual_seed(s);torch.cuda.manual_seed_all(s);torch.backends.cudnn.deterministic=True;torch.backends.cudnn.benchmark=False
def rows():
    allr=[json.loads(x) for x in DATA.read_text(encoding="utf8").splitlines() if x.strip()]; out=[]
    for lang in ("ar","en"):
      for sub in ("MATH","LANGUAGE"):
       for lev in (1,2,3): out += [r for r in allr if r["language"]==lang and r["subject"]==sub and r["level"]==lev][:2]
    assert len(out)==24;return out
def run(seed,rs,runtime):
    from transformers import Adafactor,AutoModelForSeq2SeqLM,AutoTokenizer,__version__ as tv
    seed_all(seed);tok=AutoTokenizer.from_pretrained("google/mt5-small",use_fast=False);model=AutoModelForSeq2SeqLM.from_pretrained("google/mt5-small").to("cuda");enc=[(r,tok(r["input_condition"],return_tensors="pt",max_length=160,truncation=True),tok(r["targets"]["question_only_v064"],return_tensors="pt",max_length=64,truncation=True)["input_ids"][0]) for r in rs];loader=DataLoader(list(range(24)),batch_size=2,shuffle=False);opt=Adafactor(model.parameters(),lr=1e-3,relative_step=False,scale_parameter=False,warmup_init=False,clip_threshold=1.0,weight_decay=0.0);hist=[];start=time.perf_counter()
    def evaluate(step):
        model.eval();m={"strict_parse":0,"language_pass":0,"semantic_binding":0,"level_style":0}
        with torch.no_grad():
          for r,inp,_ in enc:
            ids=model.generate(**{k:v.to("cuda") for k,v in inp.items()},do_sample=False,max_new_tokens=48)[0].cpu().tolist(); raw=tok.decode([x for x in ids if x not in {tok.pad_token_id,tok.eos_token_id}],skip_special_tokens=False,clean_up_tokenization_spaces=False);q=None
            try:q=parse_question(raw);m["strict_parse"]+=1
            except ValueError:pass
            text=q or ""; ar=bool(re.search(r"[\u0600-\u06FF]",text));m["language_pass"]+=int((ar and r["language"]=="ar") or (not ar and r["language"]=="en"));m["semantic_binding"]+=int(bool(q) and semantic_binding(r,q));m["level_style"]+=int(bool(q) and level_style(r,q)["compatible"])
        m["step"]=step;return m
    for step in range(1,1201):
      batch=list(next(iter(loader))) if False else [(rs[i],enc[i][1],enc[i][2]) for i in range((step-1)%24,min((step-1)%24+2,24))]
      losses=[]
      for _,inp,lab in batch: losses.append(model(**{k:v.to("cuda") for k,v in inp.items()},labels=lab.to("cuda").unsqueeze(0)).loss)
      loss=sum(losses)/len(losses);loss.backward();opt.step();opt.zero_grad(set_to_none=True)
      if step%200==0:
        m=evaluate(step);m["mean_train_loss"]=float(loss.item());hist.append(m);print(f"seed={seed} step={step} {m}",flush=True)
        if all(m[k]>=22 for k in ("strict_parse","language_pass","semantic_binding")) and m["level_style"]>=20:break
    final=hist[-1];report={"version":"v0.6.4","seed":seed,"conditions":24,"steps_completed":final["step"],"train_batch_size":2,"evaluation_batch_size":1,"max_steps":1200,"precision":"FP32","optimizer":"Adafactor","learning_rate":1e-3,"base_model":"google/mt5-small","final":final,"history":hist,"pass_gate":all(final[k]>=22 for k in ("strict_parse","language_pass","semantic_binding")) and final["level_style"]>=20,"python_version":platform.python_version(),"pytorch_version":torch.__version__,"transformers_version":tv,"gpu":torch.cuda.get_device_name(0),"hidden_test_open_count":0,"runtime_seconds":time.perf_counter()-start};(runtime/f"v064_sanity_seed{seed}.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf8");del model;torch.cuda.empty_cache();return report
def main():
    if not torch.cuda.is_available():raise RuntimeError("CUDA required")
    runtime=resolve_runtime_paths(ROOT).outputs_dir;runtime.mkdir(parents=True,exist_ok=True);rs=rows();reports=[run(s,rs,runtime) for s in (42,43,44)];summary={"version":"v0.6.4","seeds":[{"seed":r["seed"],"steps_to_gate":r["steps_completed"],"final":r["final"],"pass_gate":r["pass_gate"]} for r in reports],"all_three_passed":all(r["pass_gate"] for r in reports),"full_training_allowed":all(r["pass_gate"] for r in reports)};(runtime/"v064_sanity_summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf8");print(json.dumps(summary,ensure_ascii=False,indent=2));assert summary["all_three_passed"]
if __name__=="__main__":main()
