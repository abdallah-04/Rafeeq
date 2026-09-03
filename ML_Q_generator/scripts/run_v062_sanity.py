from __future__ import annotations

import json
import platform
import random
import re
import sys
import time
from pathlib import Path

import numpy as np
import torch

ROOT = Path(__file__).resolve().parents[1]; sys.path.insert(0, str(ROOT / "src"))
from rafeeq_qg.runtime_paths import resolve_runtime_paths
from rafeeq_qg.v061_formats import parse_short

DATA = ROOT / "data" / "v062" / "master_v062.jsonl"


def seed_all(seed: int) -> None:
    random.seed(seed); np.random.seed(seed); torch.manual_seed(seed)
    if torch.cuda.is_available(): torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True; torch.backends.cudnn.benchmark = False


def rows_for_sanity() -> list[dict]:
    rows = [json.loads(line) for line in DATA.read_text(encoding="utf-8").splitlines() if line.strip()]
    selected = []
    for language in ("ar", "en"):
        for subject in ("MATH", "LANGUAGE"):
            for level in (1, 2, 3):
                selected.extend([row for row in rows if row["split"] == "train" and row["language"] == language and row["subject"] == subject and row["level"] == level][:2])
    assert len(selected) == 24 and all(row["split"] == "train" for row in selected); assert len({row["input_condition"] for row in selected}) == 24
    return selected


def clean_decode(tokenizer, ids: list[int]) -> str:
    excluded = {tokenizer.pad_token_id, tokenizer.eos_token_id}
    return tokenizer.decode([value for value in ids if value not in excluded], skip_special_tokens=False, clean_up_tokenization_spaces=False).strip()


def evaluate(model, tokenizer, rows, encoded, step: int) -> dict:
    model.eval(); strict = language = 0; outputs = []
    with torch.no_grad():
        for row, (inputs, _) in zip(rows, encoded):
            ids = model.generate(**{key: value.to(model.device) for key, value in inputs.items()}, do_sample=False, max_new_tokens=64)[0].cpu().tolist(); raw = clean_decode(tokenizer, ids); parsed = None
            try: parsed = parse_short(raw); strict += 1
            except ValueError: pass
            language_ok = bool(parsed) and (len(re.findall(r"[\u0600-\u06FF]+", parsed["question"] + " " + parsed["explanation"])) >= 2 if row["language"] == "ar" else len(re.findall(r"[A-Za-z]+", parsed["question"] + " " + parsed["explanation"])) >= 2 and not re.search(r"[\u0600-\u06FF]", parsed["question"] + " " + parsed["explanation"]))
            language += int(language_ok); outputs.append({"id": row["id"], "raw_output": raw, "parsed": parsed, "language_pass": language_ok})
    return {"step": step, "strict_parse": strict, "language_pass": language, "outputs": outputs}


def run(seed: int, rows: list[dict], runtime: Path) -> dict:
    from transformers import Adafactor, AutoModelForSeq2SeqLM, AutoTokenizer, __version__ as transformers_version
    seed_all(seed); tokenizer = AutoTokenizer.from_pretrained("google/mt5-small", use_fast=False); model = AutoModelForSeq2SeqLM.from_pretrained("google/mt5-small").to("cuda"); model.config.use_cache = False
    encoded = [(tokenizer(row["input_condition"], return_tensors="pt", max_length=128, truncation=True), tokenizer(row["targets"]["short_sentinel_v062"], return_tensors="pt", max_length=96, truncation=True)["input_ids"][0]) for row in rows]
    optimizer = Adafactor(model.parameters(), lr=1e-3, relative_step=False, scale_parameter=False, warmup_init=False, clip_threshold=1.0, weight_decay=0.0); history = []; started = time.perf_counter(); gate_streak = 0
    for step in range(1, 1201):
        inputs, labels = encoded[(step - 1) % 24]; loss = model(**{key: value.to("cuda") for key, value in inputs.items()}, labels=labels.to("cuda").unsqueeze(0)).loss; loss.backward(); optimizer.step(); optimizer.zero_grad(set_to_none=True)
        if step % 200 == 0:
            metrics = evaluate(model, tokenizer, rows, encoded, step); metrics["training_loss"] = float(loss.item()); history.append(metrics); print(f"seed={seed} step={step} loss={metrics['training_loss']:.4f} parse={metrics['strict_parse']}/24 language={metrics['language_pass']}/24", flush=True)
            gate_streak = gate_streak + 1 if metrics["strict_parse"] >= 22 and metrics["language_pass"] >= 22 else 0
            if gate_streak >= 2: break
    final = history[-1]; report = {"seed": seed, "conditions": 24, "steps_completed": final["step"], "max_steps": 1200, "optimizer_steps": final["step"], "optimizer": "Adafactor", "learning_rate": 1e-3, "precision": "FP32", "base_model": "google/mt5-small", "python_version": platform.python_version(), "pytorch_version": torch.__version__, "transformers_version": transformers_version, "cuda_version": torch.version.cuda, "gpu": torch.cuda.get_device_name(0), "cudnn_deterministic": torch.backends.cudnn.deterministic, "cudnn_benchmark": torch.backends.cudnn.benchmark, "history": history, "final": final, "pass_gate": final["strict_parse"] >= 22 and final["language_pass"] >= 22, "runtime_seconds": time.perf_counter() - started, "validation_or_test_loaded": False}
    (runtime / f"v062_sanity_seed{seed}.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"); del model; torch.cuda.empty_cache(); return report


def main() -> None:
    if not torch.cuda.is_available(): raise RuntimeError("CUDA required")
    rows = rows_for_sanity(); runtime = resolve_runtime_paths(ROOT).outputs_dir; runtime.mkdir(parents=True, exist_ok=True); reports = [run(seed, rows, runtime) for seed in (42, 43, 44)]
    summary = {"seeds": [{"seed": report["seed"], "steps_to_gate": next((item["step"] for item in report["history"] if item["strict_parse"] >= 22 and item["language_pass"] >= 22), None), "final_strict_parse": report["final"]["strict_parse"], "final_language_pass": report["final"]["language_pass"], "pass_gate": report["pass_gate"]} for report in reports], "all_three_passed": all(report["pass_gate"] for report in reports), "full_training_allowed": all(report["pass_gate"] for report in reports)}
    (runtime / "v062_sanity_summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"); print(json.dumps(summary, ensure_ascii=False, indent=2))
    if not summary["all_three_passed"]: raise SystemExit("v0.6.2 sanity gate failed; full training must not run")


if __name__ == "__main__": main()
