import json
from pathlib import Path

from rafeeq_qg.dataset_builder import build_records, build_sanity_records, split_by_unit, write_splits


def _rows(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line]


def test_canonical_dataset_is_unit_disjoint_and_one_to_one(tmp_path):
    root = Path(__file__).resolve().parents[1]
    counts = write_splits(root / "data" / "curriculum_demo.json", tmp_path, seed=42)
    assert counts == {"train": 60, "validation": 6, "test": 6}
    splits = {name: _rows(tmp_path / f"{name}.jsonl") for name in counts}
    unit_ids = {name: {row["curriculum_unit_id"] for row in rows} for name, rows in splits.items()}
    assert not unit_ids["train"] & unit_ids["validation"]
    assert not unit_ids["train"] & unit_ids["test"]
    assert not unit_ids["validation"] & unit_ids["test"]
    for rows in splits.values():
        by_input = {}
        by_unit = {}
        for row in rows:
            by_input.setdefault(row["input"]["condition"], set()).add(row["target"])
            by_unit.setdefault(row["curriculum_unit_id"], set()).add(row["language"])
            assert "<extra_id_" not in row["target"]
            assert row["target"].count("<OPTION_") == 4
        assert all(len(targets) == 1 for targets in by_input.values())
        assert all(languages == {"ar", "en"} for languages in by_unit.values())


def test_sanity_dataset_uses_only_training_units_and_has_twelve_unique_inputs():
    root = Path(__file__).resolve().parents[1]
    records = build_sanity_records(root / "data" / "curriculum_demo.json", seed=42)
    assert len(records) == 12
    assert len({row["input"]["condition"] for row in records}) == 12
    assert {row["language"] for row in records} == {"ar", "en"}
    assert {row["level"] for row in records} == {1, 2, 3}
    assert {row["subject"] for row in records} == {"MATH", "LANGUAGE"}
    canonical_splits = split_by_unit(build_records(root / "data" / "curriculum_demo.json", seed=42), seed=42)
    train_unit_ids = {row["curriculum_unit_id"] for row in canonical_splits["train"]}
    assert {row["curriculum_unit_id"] for row in records}.issubset(train_unit_ids)
