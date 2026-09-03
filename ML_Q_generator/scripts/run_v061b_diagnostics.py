from __future__ import annotations

import json
import random
import re
import sys
import time
from pathlib import Path

import torch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from rafeeq_qg.v061_formats import parse_question_only, parse_short
from rafeeq_qg.runtime_paths import resolve_runtime_paths

DATA = ROOT / "data" / "v061" / "master_v061.jsonl"
ARABIC = re.compile(r"[\u0600-\u06FF]+")
LATIN = re.compile(r"[A-Za-z]+")


def sanity_rows() -> list[dict]:
    all_rows = [json.loads(line) for line in DATA.read_text(encoding="utf-8").splitlines() if line.strip() and "-v061-historical" in line]
    selected = []
    for language in ("ar", "en"):
        for subject in ("MATH", "LANGUAGE"):
            for level in (1, 2, 3):
                selected.extend([row for row in all_rows if row["language"] == language and row["subject"] == subject and row["level"] == level][:2])
    assert len(selected) == 24 and len({row["input_condition"] for row in selected}) == 24
    assert all(row["historical_split"] == "train" for row in selected)
    return selected


def clean_decode(tokenizer, ids: list[int]) -> str:
    excluded = {tokenizer.pad_token_id, tokenizer.eos_token_id}
    return tokenizer.decode([value for value in ids if value not in excluded], skip_special_tokens=False, clean_up_tokenization_spaces=False).strip()


def lang_pass(text: str, language: str) -> bool:
    arabic, latin = len(ARABIC.findall(text)), len(LATIN.findall(text))
    return arabic >= 2 and arabic >= latin if language == "ar" else latin >= 2 and arabic == 0


def target(row: dict, mode: str) -> str:
    if mode == "short": return row["targets"]["short_sentinel_v061"]
    return f"<extra_id_0> {row['training_expected']['question']} <extra_id_1>"


def audit_rows(tokenizer, rows: list[dict]) -> list[dict]:
    table = []
    for row in rows:
        input_ids = tokenizer(row["input_condition"], return_tensors="pt")["input_ids"][0]
        target_ids = tokenizer(target(row, "short"), return_tensors="pt")["input_ids"][0]
        parse_short(target(row, "short"))
        table.append({"id": row["id"], "language": row["language"], "subject": row["subject"], "level": row["level"], "task_type": row["task_type"], "input_tokens": int(input_ids.numel()), "target_tokens": int(target_ids.numel()), "expected_short_target": target(row, "short")})
    return table


@torch.no_grad()
def evaluate(model, tokenizer, rows, encoded, mode: str, step: int) -> dict:
    model.eval(); outputs = []; strict = language = q_exact = e_exact = 0
    parser = parse_short if mode == "short" else parse_question_only
    for row, (inputs, _) in zip(rows, encoded):
        ids = model.generate(**{k: v.to(model.device) for k, v in inputs.items()}, do_sample=False, max_new_tokens=64)[0].cpu().tolist()
        raw = clean_decode(tokenizer, ids); parsed = None; failure = None
        try: parsed = parser(raw); strict += 1
        except ValueError as exc: failure = str(exc)
        if parsed:
            text = parsed["question"] + (" " + parsed["explanation"] if mode == "short" else "")
            language += int(lang_pass(text, row["language"]))
            expected = row["training_expected"]
            q_exact += int(parsed["question"] == expected["question"])
            e_exact += int(mode == "question_only" or parsed["explanation"] == expected["explanation"])
        outputs.append({"id": row["id"], "model_input": row["input_condition"], "expected_target": target(row, mode), "raw_output": raw, "parsed": parsed, "failure_category": categorize(failure, raw, parsed, row, mode), "strict_parse": bool(parsed), "language_pass": bool(parsed) and lang_pass(parsed["question"] + (" " + parsed.get("explanation", "")), row["language"])})
    return {"step": step, "strict_parse": strict, "language_pass": language, "question_exact_match": q_exact, "explanation_exact_match": e_exact, "outputs": outputs}


def categorize(error, raw, parsed, row, mode):
    if parsed:
        return "content mismatch only" if not (parsed["question"] == row["training_expected"]["question"]) else "wrong language" if not lang_pass(parsed["question"] + " " + parsed.get("explanation", ""), row["language"]) else "other"
    if len(raw.strip()) < 5: return "truncation"
    if "extra_id_0" not in raw: return "missing extra_id_0"
    if "extra_id_1" not in raw: return "missing extra_id_1"
    if mode == "short" and "extra_id_2" not in raw: return "missing extra_id_2"
    if raw.count("<extra_id_") > (3 if mode == "short" else 2): return "unexpected sentinel"
    return "other"


def teacher_diagnostics(model, encoded, rows, mode):
    diagnostics = []
    for row, (inputs, labels) in zip(rows, encoded):
        labels = labels.to(model.device).unsqueeze(0); batch = {k: v.to(model.device) for k, v in inputs.items()}; logits = model(**batch, decoder_input_ids=model._shift_right(labels)).logits[0]; target_ids = labels[0]; valid = target_ids != -100; predictions = logits.argmax(-1); token_accuracy = float((predictions[valid] == target_ids[valid]).float().mean())
        ranks = []
        for index, token_id in enumerate(target_ids.tolist()):
            if token_id in {model.config.pad_token_id, -100}: continue
            order = torch.argsort(logits[index], descending=True); ranks.append({"index": index, "token_id": token_id, "token_rank": int((order == token_id).nonzero(as_tuple=False)[0].item() + 1), "is_sentinel": token_id in {model.config.decoder_start_token_id, 0}})
        diagnostics.append({"id": row["id"], "teacher_forced_token_accuracy": token_accuracy, "first_target_token": ranks[0] if ranks else None, "sentinel_token_diagnostics": [item for item in ranks if item["is_sentinel"]], "target_contains_pad": int(model.config.pad_token_id in target_ids.tolist()), "target_ids": target_ids.tolist()})
    return diagnostics


def train_control(rows, mode: str, max_steps: int, eval_every: int, output_name: str, runtime) -> dict:
    from transformers import Adafactor, AutoModelForSeq2SeqLM, AutoTokenizer
    random.seed(42); torch.manual_seed(42); tokenizer = AutoTokenizer.from_pretrained("google/mt5-small", use_fast=False); model = AutoModelForSeq2SeqLM.from_pretrained("google/mt5-small").to("cuda"); model.config.use_cache = False
    encoded = []
    for row in rows:
        inputs = tokenizer(row["input_condition"], return_tensors="pt", max_length=128, truncation=True); labels = tokenizer(target(row, mode), return_tensors="pt", max_length=96, truncation=True)["input_ids"][0]; encoded.append((inputs, labels))
    optimizer = Adafactor(model.parameters(), lr=1e-3, relative_step=False, scale_parameter=False, warmup_init=False, clip_threshold=1.0, weight_decay=0.0); history = []; started = time.perf_counter(); consecutive = 0
    for step in range(1, max_steps + 1):
        index = (step - 1) % len(encoded); inputs, labels = encoded[index]; loss = model(**{k: v.to("cuda") for k, v in inputs.items()}, labels=labels.to("cuda").unsqueeze(0)).loss; loss.backward(); optimizer.step(); optimizer.zero_grad(set_to_none=True)
        if step % eval_every == 0 or step == max_steps:
            metrics = evaluate(model, tokenizer, rows, encoded, mode, step); metrics["training_loss"] = float(loss.item()); metrics["teacher_forced_token_accuracy"] = sum(item["teacher_forced_token_accuracy"] for item in teacher_diagnostics(model, encoded, rows, mode)) / len(rows); history.append(metrics); print(f"{mode} step={step} loss={metrics['training_loss']:.4f} parse={metrics['strict_parse']}/24 language={metrics['language_pass']}/24", flush=True)
            if metrics["strict_parse"] >= 22 and metrics["language_pass"] >= 22: consecutive += 1
            else: consecutive = 0
            if consecutive >= 2: break
    final = history[-1]; report = {"mode": mode, "max_steps": max_steps, "steps_completed": final["step"], "optimizer_steps": final["step"], "history": history, "final": final, "teacher_diagnostics": teacher_diagnostics(model, encoded, rows, mode), "runtime_seconds": time.perf_counter() - started}
    (runtime / output_name).write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"); del model; torch.cuda.empty_cache(); return report


def main() -> None:
    if not torch.cuda.is_available(): raise RuntimeError("CUDA required")
    rows = sanity_rows(); runtime = resolve_runtime_paths(ROOT).outputs_dir; runtime.mkdir(parents=True, exist_ok=True)
    from transformers import AutoTokenizer
    tokenizer = AutoTokenizer.from_pretrained("google/mt5-small", use_fast=False); table = audit_rows(tokenizer, rows); (runtime / "v061b_24_example_audit.json").write_text(json.dumps({"rows": table, "unique_inputs": len({r["input_condition"] for r in rows}), "all_train_only": all(r["historical_split"] == "train" for r in rows)}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    reproduction = train_control(rows, "short", 720, 200, "v061b_reproduction.json", runtime)
    if reproduction["final"]["strict_parse"] >= 22 and reproduction["final"]["language_pass"] >= 22:
        comparison = {"original_historical": {"steps": 720, "strict_parse": 18, "language_pass": 18}, "reproduction": {"steps": reproduction["steps_completed"], "strict_parse": reproduction["final"]["strict_parse"], "language_pass": reproduction["final"]["language_pass"]}, "decision_gate_a": "PASS", "decision": "KEEP QUESTION+EXPLANATION", "full_training_run": False, "question_only_control": "not run because Decision Gate A passed"}
        (runtime / "v061b_comparison.json").write_text(json.dumps(comparison, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(comparison, ensure_ascii=False, indent=2))
        return
    failed = [row for row, result in zip(rows, reproduction["final"]["outputs"]) if not result["strict_parse"] or not result["language_pass"]]
    subset = train_control(failed, "short", 2000, 200, "v061b_failed_subset.json", runtime) if failed else {"final": {"outputs": []}}
    question_only = train_control(rows, "question_only", 3000, 200, "v061b_question_only_control.json", runtime)
    comparison = {"original_historical": {"steps": 720, "strict_parse": 18, "language_pass": 18}, "reproduction": {"steps": reproduction["steps_completed"], "strict_parse": reproduction["final"]["strict_parse"], "language_pass": reproduction["final"]["language_pass"]}, "failed_subset": {"rows": len(failed), "steps": subset.get("steps_completed")}, "question_only": {"steps": question_only["steps_completed"], "strict_parse": question_only["final"]["strict_parse"], "language_pass": question_only["final"]["language_pass"]}}
    (runtime / "v061b_comparison.json").write_text(json.dumps(comparison, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"); print(json.dumps(comparison, ensure_ascii=False, indent=2))


if __name__ == "__main__": main()
