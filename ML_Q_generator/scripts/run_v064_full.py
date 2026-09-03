from __future__ import annotations
import hashlib,json,platform,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/"src"))
from rafeeq_qg.runtime_paths import resolve_runtime_paths
TRAIN=ROOT/"data"/"v064"/"train_v064.jsonl"; VAL=ROOT/"data"/"v064"/"validation_v064.jsonl"; HIDDEN=ROOT/"data"/"v064"/"hidden_test_v064.jsonl"
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def main():
    runtime=resolve_runtime_paths(ROOT); runtime.outputs_dir.mkdir(parents=True,exist_ok=True); runtime.checkpoints_dir.mkdir(parents=True,exist_ok=True)
    config={"version":"v0.6.4","model":"google/mt5-small","seeds":[42,43,44],"epochs":10,"patience":3,"train_batch_size":2,"eval_batch_size":4,"precision":"FP32","hidden_file":str(HIDDEN)}; fingerprint=hashlib.sha256(json.dumps(config,sort_keys=True).encode()).hexdigest(); progress_path=runtime.outputs_dir/"v064_progress.json"
    progress={"version":"v0.6.4","status":"ready_for_batched_full_training","hidden_evaluated":False,"hidden_test_open_count":0,"dataset_sha256":{"train":sha(TRAIN),"validation":sha(VAL),"hidden":sha(HIDDEN)},"config_fingerprint":fingerprint,"config":config,"resume_policy":"refuse mismatched dataset/config/seed/model"}
    progress_path.write_text(json.dumps(progress,indent=2)+"\n",encoding="utf8")
    raise SystemExit("v0.6.4 full runner scaffold is resumable and hidden-locked; run after batched GPU training implementation is enabled")
if __name__=="__main__": main()
