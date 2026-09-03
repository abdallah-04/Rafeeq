from __future__ import annotations
import json,platform,random,re,sys,time
from pathlib import Path
import numpy as np,torch
from torch.utils.data import DataLoader
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/"src"))
from rafeeq_qg.runtime_paths import resolve_runtime_paths
from rafeeq_qg.v064_formats import parse_question
from rafeeq_qg.v064b_planner import level_style,semantic_binding
DATA=ROOT/"data/v064b/train_v064b.jsonl"
def seed_all(s):random.seed(s);np.random.seed(s);torch.manual_seed(s);torch.cuda.manual_seed_all(s);torch.backends.cudnn.deterministic=True;torch.backends.cudnn.benchmark=False
def rows_for_sanity():
    allr=[json.loads(x) for x in DATA.read_text(encoding="utf8").splitlines() if x.strip()];out=[]
    for lang in ("ar","en"):
      for sub in ("MATH","LANGUAGE"):
       for lev in (1,2,3):out += [r for r in allr if r["language"]==lang and r["subject"]==sub and r["level"]==lev][:2]
    assert len(out)==24;return out
def collate(tok,batch):
    x=tok([r["input_condition"] for r in batch],return_tensors="pt",padding=True,truncation=True,max_length=192);y=tok([r["targets"]["question_only_v064b"] for r in batch],return_tensors="pt",padding=True,truncation=True,max_length=72)["input_ids"];y[y==tok.pad_token_id]=-100;return x,y
def evaluate(model,tok,rows,step):
    model.eval();m={"strict_parse":0,"language_pass":0,"semantic_binding":0,"level_style":0};acc_num=acc_den=0
    with torch.no_grad():
      for i in range(0,24,4):
        part=rows[i:i+4];x=tok([r["input_condition"] for r in part],return_tensors="pt",padding=True,truncation=True,max_length=192);ids=model.generate(**{k:v.to("cuda") for k,v in x.items()},do_sample=False,max_new_tokens=56)
        for r,z in zip(part,ids):
          raw=tok.decode([v for v in z.cpu().tolist() if v not in {tok.pad_token_id,tok.eos_token_id}],skip_special_tokens=False,clean_up_tokenization_spaces=False);q=None
          try:q=parse_question(raw);m["strict_parse"]+=1
          except ValueError:pass
          text=q or "";ar=bool(re.search(r"[\u0600-\u06FF]",text));m["language_pass"]+=int((ar and r["language"]=="ar") or (not ar and r["language"]=="en"));m["semantic_binding"]+=int(bool(q) and semantic_binding(r,q));m["level_style"]+=int(bool(q) and level_style(r,q)["compatible"])
          if q:
            ref=parse_question(r["targets"]["question_only_v064b"]);a=text.split();b=ref.split();acc_num+=sum(x==y for x,y in zip(a,b));acc_den+=max(len(b),len(a))
    m["step"]=step;m["teacher_forced_token_accuracy"]=None;m["generated_token_overlap_diagnostic"]=acc_num/max(1,acc_den);return m
def run(seed,rows,runtime):
    from transformers import Adafactor,AutoModelForSeq2SeqLM,AutoTokenizer,__version__ as tv
    seed_all(seed);tok=AutoTokenizer.from_pretrained("google/mt5-small",use_fast=False);model=AutoModelForSeq2SeqLM.from_pretrained("google/mt5-small").to("cuda");enc=[(r,tok(r["input_condition"],return_tensors="pt",max_length=192,truncation=True),tok(r["targets"]["question_only_v064b"],return_tensors="pt",max_length=72,truncation=True)["input_ids"][0]) for r in rows];opt=Adafactor(model.parameters(),lr=1e-3,relative_step=False,scale_parameter=False,warmup_init=False,clip_threshold=1.0,weight_decay=0.0);hist=[];streak=0;first=None;start=time.perf_counter()
    for step in range(1,1601):
      indices=list(range((step-1)%24,min((step-1)%24+2,24)));losses=[]
      for i in indices:losses.append(model(**{k:v.to("cuda") for k,v in enc[i][1].items()},labels=enc[i][2].to("cuda").unsqueeze(0)).loss)
      loss=sum(losses)/len(losses);loss.backward();opt.step();opt.zero_grad(set_to_none=True)
      if step%200==0:
        m=evaluate(model,tok,rows,step);m["mean_train_loss"]=float(loss.item());hist.append(m);qual=all(m[k]>=22 for k in ("strict_parse","language_pass","semantic_binding")) and m["level_style"]>=20;first=first or (step if qual else None);streak=streak+1 if qual else 0;print(f"seed={seed} step={step} {m}",flush=True)
        if streak>=2:break
    final=hist[-1];report={"version":"v0.6.4b","seed":seed,"conditions":24,"steps_completed":final["step"],"first_qualifying_step":first,"stable_gate_step":final["step"] if streak>=2 else None,"max_steps":1600,"batch_size":2,"evaluation_batch_size":4,"precision":"FP32","optimizer":"Adafactor","learning_rate":1e-3,"base_model":"google/mt5-small","history":hist,"final":final,"pass_gate":streak>=2,"environment":{"python":platform.python_version(),"pytorch":torch.__version__,"transformers":tv,"cuda":torch.version.cuda,"gpu":torch.cuda.get_device_name(0)},"validation_generation_count":0,"hidden_test_open_count":0,"runtime_seconds":time.perf_counter()-start};(runtime/f"v064b_sanity_seed{seed}.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf8");del model;torch.cuda.empty_cache();return report
def main():
    if not torch.cuda.is_available():raise RuntimeError("CUDA required")
    runtime=resolve_runtime_paths(ROOT).outputs_dir;runtime.mkdir(parents=True,exist_ok=True);rs=rows_for_sanity();reports=[]
    for seed in (42,43,44):
      r=run(seed,rs,runtime);reports.append(r)
      if not r["pass_gate"]:break
    summary={"version":"v0.6.4b","seeds":[{"seed":r["seed"],"first_qualifying_step":r["first_qualifying_step"],"stable_gate_step":r["stable_gate_step"],"final":r["final"],"pass_gate":r["pass_gate"]} for r in reports],"all_three_passed":len(reports)==3 and all(r["pass_gate"] for r in reports),"full_training_allowed":False,"validation_generation_count":0,"hidden_test_open_count":0};(runtime/"v064b_sanity_summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf8");print(json.dumps(summary,ensure_ascii=False,indent=2));assert summary["all_three_passed"]
if __name__=="__main__":main()
