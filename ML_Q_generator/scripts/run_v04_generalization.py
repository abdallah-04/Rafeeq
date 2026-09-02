from __future__ import annotations

import argparse
import json
import math
import random
import shutil
import sys
import time
from pathlib import Path

import torch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from rafeeq_qg.runtime_paths import resolve_runtime_paths
from rafeeq_qg.v04_evaluation import aggregate_results, evaluate_raw_output, validation_rank

CONFIG_PATH = ROOT / "config_v04.yaml"


def load_config() -> dict:
    import yaml
    return yaml.safe_load(CONFIG_PATH.read_text(encoding="utf-8"))


def read_split(master_path: Path, split: str) -> list[dict]:
    rows = []
    for line in master_path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        if row["historical_split"] == split:
            rows.append(row)
    return rows


def preflight(master_path: Path, manifest_path: Path) -> dict:
    rows = [json.loads(line) for line in master_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert len(rows) == 72
    assert len({row["input_condition"] for row in rows}) == 72
    assert {row["historical_split"] for row in rows} == {"train", "validation", "test"}
    counts = {split: sum(row["historical_split"] == split for row in rows) for split in ("train", "validation", "test")}
    assert counts == {"train": 60, "validation": 6, "test": 6}
    for unit in {row["curriculum_unit_id"] for row in rows}:
        unit_rows = [row for row in rows if row["curriculum_unit_id"] == unit]
        assert len(unit_rows) == 2
        assert {row["language"] for row in unit_rows} == {"ar", "en"}
        assert len({row["historical_split"] for row in unit_rows}) == 1
    letters = {split: {letter: 0 for letter in "ABCD"} for split in ("train", "validation", "test")}
    all_letters = {letter: 0 for letter in "ABCD"}
    for row in rows:
        letter = row["training_expected"]["correct_letter"]
        letters[row["historical_split"]][letter] += 1
        all_letters[letter] += 1
        assert row["targets"]["sentinel_native_v2"].startswith("<extra_id_0>")
        assert row["targets"]["sentinel_native_v2"].rstrip().endswith("<extra_id_7>")
    assert letters["train"] == {"A": 15, "B": 15, "C": 15, "D": 15}
    assert set(letter for letter, count in letters["validation"].items() if count) == set("ABCD")
    assert set(letter for letter, count in letters["test"].items() if count) == set("ABCD")
    assert all_letters == {"A": 18, "B": 18, "C": 18, "D": 18}
    assert manifest["counts"] == counts
    return {"rows": 72, "unique_conditions": 72, "split_counts": counts, "correct_letters": letters, "all_correct_letters": all_letters}


def set_seed(seed: int) -> None:
    random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def decode(tokenizer, ids: list[int]) -> str:
    excluded = {tokenizer.pad_token_id, tokenizer.eos_token_id}
    kept = [value for value in ids if value not in excluded]
    return tokenizer.decode(kept, skip_special_tokens=False, clean_up_tokenization_spaces=False).strip()


def prepare_rows(tokenizer, rows: list[dict], cfg: dict) -> list[dict]:
    prepared = []
    for row in rows:
        encoded = tokenizer(
            row["input_condition"], return_tensors="pt", truncation=True, max_length=cfg["model"]["max_input_length"]
        )
        labels = tokenizer(
            row["targets"]["sentinel_native_v2"], return_tensors="pt", truncation=True, max_length=cfg["model"]["max_target_length"]
        )["input_ids"][0]
        prepared.append({"row": row, "encoded": encoded, "labels": labels})
    return prepared


@torch.no_grad()
def validation_loss(model, prepared: list[dict]) -> float:
    model.eval()
    losses = []
    for item in prepared:
        batch = {key: value.to(model.device) for key, value in item["encoded"].items()}
        loss = model(**batch, labels=item["labels"].to(model.device).unsqueeze(0)).loss
        losses.append(float(loss.item()))
    return sum(losses) / len(losses)


@torch.no_grad()
def generate_results(model, tokenizer, prepared: list[dict], cfg: dict) -> list[dict]:
    model.eval()
    results = []
    for item in prepared:
        batch = {key: value.to(model.device) for key, value in item["encoded"].items()}
        output = model.generate(
            **batch,
            do_sample=False,
            num_beams=cfg["generation"].get("num_beams", 1),
            max_new_tokens=cfg["model"]["max_new_tokens"],
        )[0].detach().cpu().tolist()
        raw = decode(tokenizer, output)
        result = evaluate_raw_output(item["row"], raw)
        result["raw_token_ids"] = output
        results.append(result)
    return results


def save_checkpoint(model, tokenizer, destination: Path, metadata: dict) -> None:
    if destination.exists():
        shutil.rmtree(destination)
    destination.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(destination)
    tokenizer.save_pretrained(destination)
    (destination / "selection_metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def train_seed(seed: int, train_rows: list[dict], val_rows: list[dict], cfg: dict, runtime, force: bool) -> dict:
    from transformers import Adafactor, AutoModelForSeq2SeqLM, AutoTokenizer

    run_name = f"rafeeq-mt5-qg-v0.4-seed{seed}"
    checkpoint_dir = runtime.checkpoints_dir / run_name
    report_path = runtime.outputs_dir / f"v04_full_seed{seed}.json"
    if (checkpoint_dir.exists() or report_path.exists()) and not force:
        raise RuntimeError(f"existing v0.4 seed artifacts found for {seed}; rerun with --force to replace only this experiment")
    if force and checkpoint_dir.exists():
        shutil.rmtree(checkpoint_dir)

    set_seed(seed)
    tokenizer = AutoTokenizer.from_pretrained(cfg["model"]["name"], use_fast=False)
    model = AutoModelForSeq2SeqLM.from_pretrained(cfg["model"]["name"]).to("cuda")
    model.config.use_cache = False
    train_prepared = prepare_rows(tokenizer, train_rows, cfg)
    val_prepared = prepare_rows(tokenizer, val_rows, cfg)

    optimizer = Adafactor(
        model.parameters(),
        lr=float(cfg["training"]["learning_rate"]),
        relative_step=bool(cfg["training"]["relative_step"]),
        scale_parameter=bool(cfg["training"]["scale_parameter"]),
        warmup_init=bool(cfg["training"]["warmup_init"]),
        clip_threshold=float(cfg["training"]["clip_threshold"]),
        weight_decay=float(cfg["training"]["weight_decay"]),
    )

    best_rank = None
    best_epoch = None
    best_metrics = None
    best_loss = None
    history = []
    stale = 0
    started = time.perf_counter()
    rng = random.Random(seed)

    for epoch in range(1, int(cfg["training"]["max_epochs"]) + 1):
        order = list(range(len(train_prepared)))
        rng.shuffle(order)
        model.train()
        epoch_losses = []
        for index in order:
            item = train_prepared[index]
            batch = {key: value.to("cuda") for key, value in item["encoded"].items()}
            loss = model(**batch, labels=item["labels"].to("cuda").unsqueeze(0)).loss
            if not torch.isfinite(loss):
                raise RuntimeError(f"non-finite training loss for seed {seed} epoch {epoch}")
            loss.backward()
            optimizer.step()
            optimizer.zero_grad(set_to_none=True)
            epoch_losses.append(float(loss.item()))

        val_loss = validation_loss(model, val_prepared)
        val_results = generate_results(model, tokenizer, val_prepared, cfg)
        val_metrics = aggregate_results(val_results)
        rank = validation_rank(val_metrics, val_loss)
        epoch_record = {
            "epoch": epoch,
            "train_loss": sum(epoch_losses) / len(epoch_losses),
            "validation_loss": val_loss,
            "validation_metrics": val_metrics,
            "selection_rank": list(rank),
        }
        history.append(epoch_record)
        print(
            f"seed={seed} epoch={epoch} train={epoch_record['train_loss']:.4f} val={val_loss:.4f} "
            f"parse={val_metrics['strict_parse_count']}/6 answer={val_metrics['answer_consistency_count']}/6 "
            f"fields={val_metrics['exact_field_matches']}/42",
            flush=True,
        )

        if best_rank is None or rank > best_rank:
            best_rank = rank
            best_epoch = epoch
            best_metrics = val_metrics
            best_loss = val_loss
            stale = 0
            save_checkpoint(
                model,
                tokenizer,
                checkpoint_dir,
                {"seed": seed, "epoch": epoch, "validation_loss": val_loss, "validation_metrics": val_metrics, "selection_rank": list(rank)},
            )
        else:
            stale += 1
            if stale >= int(cfg["training"]["early_stopping_patience"]):
                break

    report = {
        "run_name": run_name,
        "seed": seed,
        "base_model": cfg["model"]["name"],
        "optimizer": "Adafactor",
        "learning_rate": cfg["training"]["learning_rate"],
        "precision": cfg["training"]["precision"],
        "best_epoch": best_epoch,
        "best_validation_loss": best_loss,
        "best_validation_metrics": best_metrics,
        "best_selection_rank": list(best_rank) if best_rank is not None else None,
        "checkpoint": str(checkpoint_dir),
        "epochs_completed": len(history),
        "history": history,
        "runtime_seconds": time.perf_counter() - started,
    }
    runtime.outputs_dir.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    del model
    torch.cuda.empty_cache()
    return report


def choose_winner(seed_reports: list[dict]) -> dict:
    # Test rows are deliberately not an argument to this function.
    def key(report):
        m = report["best_validation_metrics"]
        return (
            m["strict_parse_count"],
            m["answer_consistency_count"],
            m["exact_field_matches"],
            -(m["conditions"] - m["strict_parse_count"]),
            -report["best_validation_loss"],
        )
    return max(seed_reports, key=key)


def final_evaluate(winner: dict, cfg: dict, runtime, master_path: Path, force: bool) -> dict:
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

    final_dir = runtime.models_dir / "rafeeq-mt5-qg-v0.4-final"
    if final_dir.exists() and not force:
        raise RuntimeError(f"final model already exists at {final_dir}; use --force to replace this experiment only")
    if force and final_dir.exists():
        shutil.rmtree(final_dir)

    tokenizer = AutoTokenizer.from_pretrained(winner["checkpoint"], use_fast=False)
    model = AutoModelForSeq2SeqLM.from_pretrained(winner["checkpoint"]).to("cuda")
    model.config.use_cache = True

    # Validation is okay to re-read. TEST is loaded only now, after winner selection.
    val_rows = read_split(master_path, "validation")
    val_prepared = prepare_rows(tokenizer, val_rows, cfg)
    val_results = generate_results(model, tokenizer, val_prepared, cfg)
    val_metrics = aggregate_results(val_results)

    test_rows = read_split(master_path, "test")
    test_prepared = prepare_rows(tokenizer, test_rows, cfg)
    test_results = generate_results(model, tokenizer, test_prepared, cfg)
    test_metrics = aggregate_results(test_results)

    train_rows = read_split(master_path, "train")
    train_prepared = prepare_rows(tokenizer, train_rows, cfg)
    train_results = generate_results(model, tokenizer, train_prepared, cfg)
    train_metrics = aggregate_results(train_results)

    final_dir.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(final_dir)
    tokenizer.save_pretrained(final_dir)
    metadata = {
        "model_name": cfg["model"]["name"],
        "selected_seed": winner["seed"],
        "selected_checkpoint": winner["checkpoint"],
        "optimizer": "Adafactor",
        "learning_rate": cfg["training"]["learning_rate"],
        "train_rows": 60,
        "validation_rows": 6,
        "test_rows": 6,
        "validation_metrics": val_metrics,
        "test_metrics": test_metrics,
    }
    (final_dir / "experiment_metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    return {
        "selected_seed": winner["seed"],
        "selected_checkpoint": winner["checkpoint"],
        "final_model_dir": str(final_dir),
        "train": {"metrics": train_metrics, "results": train_results},
        "validation": {"metrics": val_metrics, "results": val_results},
        "test": {"metrics": test_metrics, "results": test_results},
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Rafeeq v0.4 three-seed held-out generalization experiment")
    parser.add_argument("--force", action="store_true", help="replace only v0.4 generalization artifacts")
    args = parser.parse_args()

    cfg = load_config()
    runtime = resolve_runtime_paths(ROOT)
    for path in (runtime.models_dir, runtime.checkpoints_dir, runtime.outputs_dir):
        path.mkdir(parents=True, exist_ok=True)

    if not torch.cuda.is_available():
        raise RuntimeError("CUDA is required for this experiment; CPU fallback is intentionally disabled")

    master_path = ROOT / cfg["data"]["master"]
    manifest_path = ROOT / cfg["data"]["manifest"]
    audit = preflight(master_path, manifest_path)
    print(json.dumps({"preflight": audit, "device": torch.cuda.get_device_name(0)}, indent=2), flush=True)

    # Important: selection code gets TRAIN and VALIDATION only.
    train_rows = read_split(master_path, "train")
    val_rows = read_split(master_path, "validation")
    seed_reports = [train_seed(seed, train_rows, val_rows, cfg, runtime, args.force) for seed in cfg["project"]["seeds"]]
    winner = choose_winner(seed_reports)

    comparison = {
        "selection_rule": ["strict_parse_count", "answer_consistency_count", "exact_field_matches", "fewest_malformed", "lowest_validation_loss"],
        "seeds": [
            {
                "seed": report["seed"],
                "best_epoch": report["best_epoch"],
                "validation_loss": report["best_validation_loss"],
                "validation_metrics": report["best_validation_metrics"],
                "checkpoint": report["checkpoint"],
            }
            for report in seed_reports
        ],
        "selected_seed": winner["seed"],
        "selected_checkpoint": winner["checkpoint"],
    }
    (runtime.outputs_dir / "v04_validation_comparison.json").write_text(json.dumps(comparison, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    final = final_evaluate(winner, cfg, runtime, master_path, args.force)
    summary = {
        "status": "COMPLETED",
        "preflight": audit,
        "config": cfg,
        "validation_comparison": comparison,
        "final": final,
        "interpretation": "Held-out generalization experiment only; not production or educational validation.",
    }
    (runtime.outputs_dir / "v04_final_experiment_summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (runtime.outputs_dir / "v04_final_test_results.json").write_text(json.dumps(final["test"], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    compact = {
        "selected_seed": final["selected_seed"],
        "train": final["train"]["metrics"],
        "validation": final["validation"]["metrics"],
        "test": final["test"]["metrics"],
        "final_model_dir": final["final_model_dir"],
    }
    print(json.dumps(compact, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
