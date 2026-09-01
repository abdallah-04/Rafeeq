import json
from pathlib import Path

from rafeeq_qg.dataset_builder import write_splits


def _rows(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line]


def test_dataset_split_is_deterministic_and_has_no_unit_leakage(tmp_path):
    root = Path(__file__).resolve().parents[1]
    counts = write_splits(root / "data" / "curriculum_demo.json", tmp_path, seed=42)
    assert counts == {"train": 54, "validation": 9, "test": 9}
    splits = {name: _rows(tmp_path / f"{name}.jsonl") for name in counts}
    unit_ids = {name: {row["curriculum_unit_id"] for row in rows} for name, rows in splits.items()}
    assert not unit_ids["train"] & unit_ids["validation"]
    assert not unit_ids["train"] & unit_ids["test"]
    assert not unit_ids["validation"] & unit_ids["test"]
    for rows in splits.values():
        assert all("condition" in row["input"] for row in rows)
        assert all(len([key for key in row["target"] if key.startswith("option_")]) == 8 for row in rows)
