from __future__ import annotations

import json
import random
from collections import Counter
from pathlib import Path

from .curriculum_loader import load_curriculum
from .generator import CurriculumGroundedGenerator
from .tokenizer_utils import format_model_input


def build_records(curriculum_path: str | Path, seed: int = 42) -> list[dict]:
    metadata, units = load_curriculum(curriculum_path)
    generator = CurriculumGroundedGenerator(metadata["curriculum_id"], seed=seed)
    records: list[dict] = []
    for unit in units:
        for variant in range(3):
            question = generator.from_unit(unit, variant)
            records.append({
                "id": f"{unit.unit_id}-q{variant + 1}",
                "curriculum_unit_id": unit.unit_id,
                "level": unit.level,
                "input": {
                    "topic_ar": unit.topic_ar,
                    "topic_en": unit.topic_en,
                    "content_ar": unit.content_ar,
                    "content_en": unit.content_en,
                    "condition": format_model_input(unit),
                },
                "target": question.as_dict(),
            })
    return records


def split_by_unit(records: list[dict], seed: int = 42) -> dict[str, list[dict]]:
    """Split by curriculum topic groups so neither units nor topics cross a split."""
    topic_groups: dict[int, dict[tuple[str, str, str], set[str]]] = {}
    for record in records:
        metadata = record["input"]
        group = (record["level"], metadata["topic_ar"], metadata["topic_en"])
        topic_groups.setdefault(record["level"], {}).setdefault(group, set()).add(record["curriculum_unit_id"])
    rng = random.Random(seed)
    splits = {"train": set(), "validation": set(), "test": set()}
    for level, grouped_units in topic_groups.items():
        groups = list(grouped_units.values())
        rng.shuffle(groups)
        for unit_ids in groups[:6]:
            splits["train"].update(unit_ids)
        for unit_ids in groups[6:7]:
            splits["validation"].update(unit_ids)
        for unit_ids in groups[7:8]:
            splits["test"].update(unit_ids)
    return {name: [record for record in records if record["curriculum_unit_id"] in ids] for name, ids in splits.items()}


def write_splits(curriculum_path: str | Path, output_dir: str | Path, seed: int = 42) -> dict[str, int]:
    records = build_records(curriculum_path, seed)
    splits = split_by_unit(records, seed)
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)
    for name, rows in splits.items():
        with (output / f"{name}.jsonl").open("w", encoding="utf-8", newline="\n") as handle:
            for row in rows:
                handle.write(json.dumps(row, ensure_ascii=False) + "\n")
    return {name: len(rows) for name, rows in splits.items()}


def level_counts(records: list[dict]) -> Counter:
    return Counter(record["level"] for record in records)
