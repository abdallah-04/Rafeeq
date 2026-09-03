from __future__ import annotations

import json
import random
import sys
import time
from pathlib import Path

import torch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from rafeeq_qg.v061_formats import parse_short
from rafeeq_qg.runtime_paths import resolve_runtime_paths

DATA = ROOT / "data" / "v061" / "master_v061.jsonl"


def main() -> None:
    from transformers import Adafactor, AutoModelForSeq2SeqLM, AutoTokenizer
    if not torch.cuda.is_available(): raise RuntimeError("CUDA is required")
    rows = [json.loads(line) for line in DATA.read_text(encoding="utf-8").splitlines() if line.strip() and 'historical' in line]
    selected = []
    for language in ("ar", "en"):
        for subject in ("MATH", "LANGUAGE"):
            for level in (1, 2, 3):
                selected.extend([row for row in rows if row["language"] == language and row["subject"] == subject and row["level"] == level][:2])
    random.seed(610); random.shuffle(selected); selected = selected[:24]
    tokenizer = AutoTokenizer.from_pretrained("google/mt5-small", use_fast=False)
    model = AutoModelForSeq2SeqLM.from_pretrained("google/mt5-small").to("cuda")
    if len(tokenizer) > model.get_input_embeddings().num_embeddings: raise RuntimeError("native tokenizer embedding mismatch")
    optimizer = Adafactor(model.parameters(), lr=1e-3, relative_step=False, scale_parameter=False, warmup_init=False, clip_threshold=1.0, weight_decay=0.0)
    encoded = [(tokenizer(row["input_condition"], return_tensors="pt", max_length=128, truncation=True), tokenizer(row["targets"]["short_sentinel_v061"], return_tensors="pt", max_length=96, truncation=True)["input_ids"][0]) for row in selected]
    started = time.perf_counter()
    for epoch in range(1, 31):
        model.train(); order = list(range(24)); random.Random(epoch).shuffle(order)
        for index in order:
            inputs, labels = encoded[index]; inputs = {k: v.to("cuda") for k, v in inputs.items()}; loss = model(**inputs, labels=labels.to("cuda").unsqueeze(0)).loss; loss.backward(); optimizer.step(); optimizer.zero_grad(set_to_none=True)
        if epoch % 5 == 0:
            passed = evaluate(model, tokenizer, selected, encoded)
            print(f"epoch={epoch} strict={passed['strict']}/24 language={passed['language']}/24", flush=True)
            if passed["strict"] >= 22 and passed["language"] >= 22:
                break
    final = evaluate(model, tokenizer, selected, encoded)
    runtime = resolve_runtime_paths(ROOT).outputs_dir
    runtime.mkdir(parents=True, exist_ok=True)
    report = {"conditions": 24, "strict_short_parse": final["strict"], "language_pass": final["language"], "pass_gate": final["strict"] >= 22 and final["language"] >= 22, "base_model": "google/mt5-small", "optimizer": "Adafactor", "learning_rate": 1e-3, "precision": "FP32", "runtime_seconds": time.perf_counter() - started, "master_training_run": False, "outputs": final["outputs"]}
    (runtime / "v061_sanity.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: report[k] for k in ("strict_short_parse", "language_pass", "pass_gate", "runtime_seconds")}, ensure_ascii=False))
    if not report["pass_gate"]: raise SystemExit("v0.6.1 sanity gate failed; full experiment must not run")


@torch.no_grad()
def evaluate(model, tokenizer, rows, encoded):
    model.eval(); outputs = []; strict = language = 0
    arabic = any
    for row, (inputs, _) in zip(rows, encoded):
        batch = {k: v.to("cuda") for k, v in inputs.items()}; ids = model.generate(**batch, do_sample=False, max_new_tokens=64)[0].cpu().tolist(); excluded = {tokenizer.pad_token_id, tokenizer.eos_token_id}; raw = tokenizer.decode([value for value in ids if value not in excluded], skip_special_tokens=False, clean_up_tokenization_spaces=False).strip()
        try: parsed = parse_short(raw); strict += 1
        except ValueError: parsed = None
        lang = bool(parsed) and (bool(__import__('re').search(r"[\u0600-\u06FF]", parsed["question"] + parsed["explanation"])) if row["language"] == "ar" else not bool(__import__('re').search(r"[\u0600-\u06FF]", parsed["question"] + parsed["explanation"])))
        language += int(lang); outputs.append({"id": row["id"], "raw_output": raw, "parsed": parsed, "language_pass": lang})
    return {"strict": strict, "language": language, "outputs": outputs}


if __name__ == "__main__": main()
