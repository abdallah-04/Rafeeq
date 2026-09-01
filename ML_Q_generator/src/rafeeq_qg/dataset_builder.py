from __future__ import annotations

import json
import random
from collections import Counter, defaultdict
from pathlib import Path

from .compact_format import CompactQuestion, format_compact_target
from .curriculum_loader import load_curriculum
from .generator import CurriculumGroundedGenerator
from .schemas import CurriculumUnit
from .tokenizer_utils import format_model_input


def _canonical_compact_question(unit: CurriculumUnit, language: str) -> CompactQuestion:
    if language not in {"ar", "en"}:
        raise ValueError("language must be ar or en")
    if language == "ar":
        question = unit.prompt_ar
        options = (unit.answer_ar, *unit.distractors_ar)
        explanation = f"الإجابة الصحيحة هي {unit.answer_ar}. {unit.content_ar}"
    else:
        question = unit.prompt_en
        options = (unit.answer_en, *unit.distractors_en)
        explanation = f"The correct answer is {unit.answer_en}. {unit.content_en}"
    return CompactQuestion(
        question=question,
        options=options,
        correct_option=1,
        explanation=explanation,
    )


def build_records(curriculum_path: str | Path, seed: int = 42) -> list[dict]:
    """Build the corrected canonical dataset: one target per unit and language."""
    _, units = load_curriculum(curriculum_path)
    records: list[dict] = []
    for unit in units:
        for language in ("ar", "en"):
            compact = _canonical_compact_question(unit, language)
            records.append({
                "id": f"{unit.unit_id}-{language}",
                "curriculum_unit_id": unit.unit_id,
                "level": unit.level,
                "subject": unit.subject,
                "language": language,
                "input": {"condition": format_model_input(unit, language)},
                "target": format_compact_target(compact),
            })
    return records


def build_augmented_records(curriculum_path: str | Path, seed: int = 42) -> list[dict]:
    """Build the historical five-variant-per-input experimental dataset."""
    metadata, units = load_curriculum(curriculum_path)
    generator = CurriculumGroundedGenerator(metadata["curriculum_id"], seed=seed)
    records: list[dict] = []
    for unit in units:
        for variant in range(5):
            question = generator.from_unit(unit, variant)
            for language in ("ar", "en"):
                options = tuple(
                    question.as_dict()[f"option_{index}{'_ar' if language == 'ar' else ''}"]
                    for index in range(1, 5)
                )
                compact = CompactQuestion(
                    question=question.question_ar if language == "ar" else question.question_en,
                    options=options,
                    correct_option=question.correct_option,
                    explanation=question.explanation_ar if language == "ar" else question.explanation_en,
                )
                records.append({
                    "id": f"{unit.unit_id}-q{variant + 1}-{language}",
                    "curriculum_unit_id": unit.unit_id,
                    "level": unit.level,
                    "subject": unit.subject,
                    "language": language,
                    "input": {"condition": format_model_input(unit, language)},
                    "target": format_compact_target(compact),
                })
    return records


def _select_training_units_for_sanity(records: list[dict], seed: int = 42) -> set[str]:
    splits = split_by_unit(records, seed)
    train_rows = splits["train"]
    by_level_subject: dict[tuple[int, str], list[str]] = defaultdict(list)
    for row in train_rows:
        by_level_subject[(row["level"], row["subject"])].append(row["curriculum_unit_id"])
    selected: set[str] = set()
    for level in (1, 2, 3):
        for subject in ("MATH", "LANGUAGE"):
            candidates = sorted(set(by_level_subject[(level, subject)]))
            if not candidates:
                raise ValueError(f"No training units found for level {level} / {subject}")
            selected.add(candidates[0])
    return selected


def build_sanity_records(curriculum_path: str | Path, seed: int = 42) -> list[dict]:
    """Build the 12-example training-only sanity dataset requested for v0.3."""
    records = build_records(curriculum_path, seed)
    selected_unit_ids = _select_training_units_for_sanity(records, seed)
    return [record for record in records if record["curriculum_unit_id"] in selected_unit_ids]


def split_by_unit(records: list[dict], seed: int = 42) -> dict[str, list[dict]]:
    """Split by unit only. This is unit-disjoint, not semantic-topic-disjoint."""
    unit_ids_by_level: dict[int, set[str]] = defaultdict(set)
    for record in records:
        unit_ids_by_level[record["level"]].add(record["curriculum_unit_id"])
    rng = random.Random(seed)
    splits = {"train": set(), "validation": set(), "test": set()}
    for level, unit_ids in sorted(unit_ids_by_level.items()):
        shuffled = list(unit_ids)
        rng.shuffle(shuffled)
        validation_count = max(1, round(len(shuffled) * 0.1))
        test_count = max(1, round(len(shuffled) * 0.1))
        train_count = len(shuffled) - validation_count - test_count
        train_units = shuffled[:train_count]
        validation_units = shuffled[train_count:train_count + validation_count]
        test_units = shuffled[train_count + validation_count:train_count + validation_count + test_count]
        splits["train"].update(train_units)
        splits["validation"].update(validation_units)
        splits["test"].update(test_units)
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


def write_sanity_records(curriculum_path: str | Path, output_path: str | Path, seed: int = 42) -> int:
    """Write the tiny 12-example sanity dataset to a single JSONL file."""
    rows = build_sanity_records(curriculum_path, seed)
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8", newline="\n") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")
    return len(rows)


def level_counts(records: list[dict]) -> Counter:
    return Counter(record["level"] for record in records)
