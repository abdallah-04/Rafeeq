from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from .compact_format import TAGS, parse_compact_target
from .tokenizer_utils import STRUCTURAL_TOKENS, decode_preserving_structural_tokens, ensure_structural_tokens, sentinel_bad_words_ids


def load_jsonl_rows(path: str | Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in Path(path).read_text(encoding="utf-8").splitlines() if line.strip()]


def summarize_rows(rows: list[dict[str, Any]]) -> dict[str, Any]:
    by_input: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        by_input[row["input"]["condition"]].append(row)

    target_dist = Counter(len({item["target"] for item in group}) for group in by_input.values())
    examples: list[dict[str, Any]] = []
    for condition, group in by_input.items():
        unique_targets: list[str] = []
        seen_targets: set[str] = set()
        for item in group:
            target = item["target"]
            if target not in seen_targets:
                seen_targets.add(target)
                unique_targets.append(target)
        if len(unique_targets) > 1:
            examples.append({"input": condition, "targets": unique_targets})
        if len(examples) >= 3:
            break

    correct_dist = Counter()
    parse_failures = 0
    for row in rows:
        try:
            parsed = parse_compact_target(row["target"])
            correct_dist["ABCD"[parsed.correct_option - 1]] += 1
        except ValueError:
            parse_failures += 1

    units = Counter(row["curriculum_unit_id"] for row in rows)
    levels = Counter(row["level"] for row in rows)
    languages = Counter(row["language"] for row in rows)
    return {
        "total_rows": len(rows),
        "unique_input_conditions": len(by_input),
        "inputs_with_multiple_distinct_targets": sum(1 for group in by_input.values() if len({item["target"] for item in group}) > 1),
        "maximum_targets_per_identical_input": max((len({item["target"] for item in group}) for group in by_input.values()), default=0),
        "targets_per_identical_input_distribution": dict(sorted(target_dist.items())),
        "exact_duplicate_input_count": sum(len(group) - 1 for group in by_input.values()),
        "correct_option_distribution": dict(sorted(correct_dist.items())),
        "parse_failures": parse_failures,
        "units_per_split": len(units),
        "languages_per_split": dict(sorted(languages.items())),
        "levels_per_split": dict(sorted(levels.items())),
        "conflicting_input_examples": examples,
    }


def audit_split_files(train_path: str | Path, validation_path: str | Path, test_path: str | Path) -> dict[str, Any]:
    split_rows = {
        "train": load_jsonl_rows(train_path),
        "validation": load_jsonl_rows(validation_path),
        "test": load_jsonl_rows(test_path),
    }
    summaries = {name: summarize_rows(rows) for name, rows in split_rows.items()}
    unit_ids = {name: {row["curriculum_unit_id"] for row in rows} for name, rows in split_rows.items()}
    overlap = {
        "train_validation": sorted(unit_ids["train"] & unit_ids["validation"]),
        "train_test": sorted(unit_ids["train"] & unit_ids["test"]),
        "validation_test": sorted(unit_ids["validation"] & unit_ids["test"]),
    }
    return {
        "splits": summaries,
        "unit_overlap": overlap,
        "unit_disjoint": not any(overlap.values()),
    }


def audit_structural_tokens(tokenizer_name: str = "google/mt5-small") -> dict[str, Any]:
    try:
        from transformers import AutoConfig, AutoTokenizer
    except ModuleNotFoundError as exc:
        raise RuntimeError("Install requirements.txt before running tokenizer diagnostics") from exc

    tokenizer = AutoTokenizer.from_pretrained(tokenizer_name, use_fast=False)
    config = AutoConfig.from_pretrained(tokenizer_name)
    tag_rows = []
    for tag in STRUCTURAL_TOKENS:
        ids = tokenizer(tag, add_special_tokens=False).input_ids
        tag_rows.append({
            "tag": tag,
            "token_ids": ids,
            "token_pieces": tokenizer.convert_ids_to_tokens(ids),
            "piece_count": len(ids),
            "decoded_skip_special_tokens": tokenizer.decode(ids, skip_special_tokens=True),
            "decoded_preserving_tokens": tokenizer.decode(ids, skip_special_tokens=False, clean_up_tokenization_spaces=False),
        })
    sentinel_rows = []
    for index in range(3):
        token = f"<extra_id_{index}>"
        ids = tokenizer(token, add_special_tokens=False).input_ids
        sentinel_rows.append({
            "token": token,
            "token_ids": ids,
            "token_pieces": tokenizer.convert_ids_to_tokens(ids),
            "piece_count": len(ids),
            "decoded_skip_special_tokens": tokenizer.decode(ids, skip_special_tokens=True),
            "decoded_preserving_tokens": tokenizer.decode(ids, skip_special_tokens=False, clean_up_tokenization_spaces=False),
        })
    return {
        "special_tokens_map": tokenizer.special_tokens_map,
        "all_special_tokens": tokenizer.all_special_tokens,
        "structural_tags": tag_rows,
        "sentinel_samples": sentinel_rows,
        "pad_token": tokenizer.pad_token,
        "pad_token_id": tokenizer.pad_token_id,
        "eos_token": tokenizer.eos_token,
        "eos_token_id": tokenizer.eos_token_id,
        "decoder_start_token_id": config.decoder_start_token_id,
        "forced_bos_token_id": getattr(config, "forced_bos_token_id", None),
        "forced_eos_token_id": getattr(config, "forced_eos_token_id", None),
        "structural_token_ids_before_registration": [tokenizer.convert_tokens_to_ids(tag) for tag in STRUCTURAL_TOKENS],
        "sentinel_bad_words_ids_sample": sentinel_bad_words_ids(tokenizer, limit=3),
    }


def audit_registered_structural_tokens(tokenizer_name: str = "google/mt5-small") -> dict[str, Any]:
    try:
        from transformers import AutoTokenizer
    except ModuleNotFoundError as exc:
        raise RuntimeError("Install requirements.txt before running tokenizer diagnostics") from exc

    tokenizer = AutoTokenizer.from_pretrained(tokenizer_name, use_fast=False)
    added = ensure_structural_tokens(tokenizer)
    tag_rows = []
    for tag in STRUCTURAL_TOKENS:
        ids = tokenizer(tag, add_special_tokens=False).input_ids
        tag_rows.append({
            "tag": tag,
            "token_ids": ids,
            "token_pieces": tokenizer.convert_ids_to_tokens(ids),
            "decoded": decode_preserving_structural_tokens(tokenizer, ids),
        })
    return {
        "added_tokens": added,
        "structural_tags_after_registration": tag_rows,
        "all_special_tokens": tokenizer.all_special_tokens,
        "structural_token_ids_after_registration": [tokenizer.convert_tokens_to_ids(tag) for tag in STRUCTURAL_TOKENS],
    }
