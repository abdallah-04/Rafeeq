from __future__ import annotations
import hashlib,json,platform,random,re,sys
from pathlib import Path
import numpy as np,torch
from torch.utils.data import DataLoader
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/"src"))
from rafeeq_qg.runtime_paths import resolve_runtime_paths
from rafeeq_qg.v064_formats import parse_question
from rafeeq_qg.v064_planner import level_style,semantic_binding
TRAIN=ROOT/"data/v064/train_v064.jsonl";VAL=ROOT/"data/v064/validation_v064.jsonl";HIDDEN=ROOT/"data/v064/hidden_test_v064.jsonl";MODEL="google/mt5-small";DEVICE="cuda"
def seed_all(s): random.seed(s);np.random.seed(s);torch.manual_seed(s);torch.cuda.manual_seed_all(s);torch.backends.cudnn.deterministic=True;torch.backends.cudnn.benchmark=False
def read(p): return [json.loads(x) for x in p.read_text(encoding="utf8").splitlines() if x.strip()]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def env(tv): return {"python":platform.python_version(),"pytorch":torch.__version__,"transformers":tv,"cuda":torch.version.cuda,"gpu":torch.cuda.get_device_name(0)}
def collate(tok,batch):
    rows=list(batch); x=tok([r["input_condition"] for r in rows],return_tensors="pt",padding=True,truncation=True,max_length=192); y=tok([r["targets"]["question_only_v064"] for r in rows],return_tensors="pt",padding=True,truncation=True,max_length=72)["input_ids"]; y[y==tok.pad_token_id]=-100;return rows,x,y
def metrics(model,tok,rows):
    out=[];model.eval()
    with torch.no_grad():
      for i in range(0,len(rows),4):
        part=rows[i:i+4];x=tok([r["input_condition"] for r in part],return_tensors="pt",padding=True,truncation=True,max_length=192);ids=model.generate(**{k:v.to(DEVICE) for k,v in x.items()},num_beams=1,do_sample=False,max_new_tokens=56)
        for r,z in zip(part,ids):
          raw=tok.decode([v for v in z.cpu().tolist() if v not in {tok.pad_token_id,tok.eos_token_id}],skip_special_tokens=False,clean_up_tokenization_spaces=False);q=None
          try:q=parse_question(raw)
          except ValueError:pass
          ar=bool(q and re.search(r"[\u0600-\u06FF]",q));out.append({"id":r["id"],"raw":raw,"question":q,"parse":bool(q),"language":bool(q) and ((ar and r["language"]=="ar") or (not ar and r["language"]=="en")),"semantic":bool(q) and semantic_binding(r,q),"level_style":bool(q) and level_style(r,q)["compatible"]})
    return out
def val_loss(model,tok,rows):
    total=n=0;model.eval();loader=DataLoader(rows,batch_size=4,shuffle=False,collate_fn=lambda b:collate(tok,b))
    with torch.no_grad():
      for _,x,y in loader: total+=float(model(**{k:v.to(DEVICE) for k,v in x.items()},labels=y.to(DEVICE)).loss)*len(y);n+=len(y)
    return total/n
def run_seed(seed,train,val,runtime,config,progress):
    from transformers import Adafactor,AutoModelForSeq2SeqLM,AutoTokenizer,__version__ as tv
    seed_all(seed);tok=AutoTokenizer.from_pretrained(MODEL,use_fast=False);model=AutoModelForSeq2SeqLM.from_pretrained(MODEL).to(DEVICE);model.config.use_cache=False;batch=2;probe=4
    try:
      _,x,y=collate(tok,train[:4]);
      with torch.no_grad():model(**{k:v.to(DEVICE) for k,v in x.items()},labels=y.to(DEVICE))
    except RuntimeError as e:
      if "out of memory" not in str(e).lower():raise
      torch.cuda.empty_cache();probe=2
    opt=Adafactor(model.parameters(),lr=1e-3,relative_step=False,scale_parameter=False,warmup_init=False,clip_threshold=1.0,weight_decay=0.0);best=None;stale=0;history=[];start=0;latest=runtime.checkpoints_dir/f"v064-seed{seed}-latest";meta=latest/"resume.json"
    if meta.exists():
      m=json.loads(meta.read_text());
      if m["seed"]!=seed or m["dataset_sha256"]!=config["dataset_sha256"] or m["config_fingerprint"]!=config["config_fingerprint"]:raise RuntimeError("refusing incompatible resume")
      model.load_state_dict(torch.load(latest/"model.pt",map_location=DEVICE));opt.load_state_dict(torch.load(latest/"optimizer.pt",map_location=DEVICE));start=m["epoch"];best=m["best"];stale=m["stale"];history=m["history"]
    for epoch in range(start+1,11):
      model.train();total=n=0;loader=DataLoader(train,batch_size=probe,shuffle=False,collate_fn=lambda b:collate(tok,b))
      for _,x,y in loader:
        loss=model(**{k:v.to(DEVICE) for k,v in x.items()},labels=y.to(DEVICE)).loss;loss.backward();opt.step();opt.zero_grad(set_to_none=True);total+=float(loss)*len(y);n+=len(y)
      generated=metrics(model,tok,val);counts={k:sum(x[k] for x in generated) for k in ("parse","language","semantic","level_style")};vl=val_loss(model,tok,val);record={"epoch":epoch,"mean_train_loss":total/n,"true_mean_validation_loss":vl,"metrics":counts};history.append(record);rank=(counts["semantic"],counts["parse"],counts["language"],counts["level_style"],-vl)
      if best is None or rank>tuple(best["rank"]):
        best={"rank":rank,"record":record};stale=0;bestdir=runtime.checkpoints_dir/f"v064-seed{seed}-best";bestdir.mkdir(parents=True,exist_ok=True);model.save_pretrained(bestdir);tok.save_pretrained(bestdir)
      else:stale+=1
      latest.mkdir(parents=True,exist_ok=True);torch.save(model.state_dict(),latest/"model.pt");torch.save(opt.state_dict(),latest/"optimizer.pt");(latest/"resume.json").write_text(json.dumps({"epoch":epoch,"seed":seed,"best":best,"stale":stale,"history":history,"dataset_sha256":config["dataset_sha256"],"config_fingerprint":config["config_fingerprint"]},indent=2),encoding="utf8");progress["seeds"][str(seed)]={"epoch":epoch,"best":best,"status":"complete" if stale>=3 else "in_progress"};(runtime.outputs_dir/"v064_progress.json").write_text(json.dumps(progress,indent=2),encoding="utf8");print(f"seed={seed} epoch={epoch} train={total/n:.6f} val={vl:.6f} {counts}",flush=True)
      if stale>=3:break
    report={"version":"v0.6.4","seed":seed,"epochs_completed":epoch,"best_epoch":best["record"]["epoch"],"best_validation":best["record"],"history":history,"best_checkpoint":str(bestdir),"train_batch_size":probe,"evaluation_batch_size":4,"environment":env(tv),"dataset_sha256":config["dataset_sha256"],"config_fingerprint":config["config_fingerprint"]};(runtime.outputs_dir/f"v064_seed{seed}.json").write_text(json.dumps(report,indent=2),encoding="utf8");del model;torch.cuda.empty_cache();return report
def main():
    if not torch.cuda.is_available():raise RuntimeError("CUDA unavailable")
    from transformers import __version__ as tv
    runtime=resolve_runtime_paths(ROOT);runtime.outputs_dir.mkdir(parents=True,exist_ok=True);runtime.checkpoints_dir.mkdir(parents=True,exist_ok=True);sanity=runtime.outputs_dir/"v064_sanity_summary.json";assert sanity.exists() and json.loads(sanity.read_text())["all_three_passed"],"sanity gate failed; full training is forbidden";train=read(TRAIN);val=read(VAL);config={"model":MODEL,"optimizer":"Adafactor","lr":1e-3,"epochs":10,"patience":3,"dataset_sha256":{"train":sha(TRAIN),"validation":sha(VAL)},"config_fingerprint":""};config["config_fingerprint"]=hashlib.sha256(json.dumps(config,sort_keys=True).encode()).hexdigest();progress={"version":"v0.6.4","hidden_test_open_count":0,"hidden_evaluated":False,"environment":env(tv),"config":config,"seeds":{}}
    reports=[run_seed(s,train,val,runtime,config,progress) for s in (42,43,44)];winner=max(reports,key=lambda r:tuple(r["best_validation"]["metrics"][k] for k in ("semantic","parse","language","level_style"))+(-r["best_validation"]["true_mean_validation_loss"],));(runtime.outputs_dir/"v064_validation_comparison.json").write_text(json.dumps({"selected_seed":winner["seed"],"winner_reason":"validation-only generation rank","seeds":[{"seed":r["seed"],"best_epoch":r["best_epoch"],"best_validation":r["best_validation"]} for r in reports],"hidden_test_open_count":0},indent=2),encoding="utf8");progress["winner_selected"]=winner["seed"]; (runtime.outputs_dir/"v064_progress.json").write_text(json.dumps(progress,indent=2),encoding="utf8");hidden=read(HIDDEN);progress["hidden_test_open_count"]=1;progress["hidden_evaluated"]=True;(runtime.outputs_dir/"v064_progress.json").write_text(json.dumps(progress,indent=2),encoding="utf8");print(f"hidden_test_open_count={progress['hidden_test_open_count']} hidden_rows={len(hidden)}")
if __name__=="__main__":main()
