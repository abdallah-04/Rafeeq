import json
from pathlib import Path

from rafeeq_qg.dataset_builder import write_splits


def _rows(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line]


def test_language_specific_dataset_is_unit_disjoint_and_sentinel_free(tmp_path):
    root = Path(__file__).resolve().parents[1]
    counts = write_splits(root / "data" / "curriculum_demo.json", tmp_path, seed=42)
    assert counts == {"train": 300, "validation": 30, "test": 30}
    splits = {name: _rows(tmp_path / f"{name}.jsonl") for name in counts}
    unit_ids = {name: {row["curriculum_unit_id"] for row in rows} for name, rows in splits.items()}
    assert not unit_ids["train"] & unit_ids["validation"]
    assert not unit_ids["train"] & unit_ids["test"]
    assert not unit_ids["validation"] & unit_ids["test"]
    for rows in splits.values():
        by_unit = {}
        for row in rows:
            by_unit.setdefault(row["curriculum_unit_id"], set()).add(row["language"])
            assert "<extra_id_" not in row["target"]
            assert row["target"].count("<OPTION_") == 4
        assert all(languages == {"ar", "en"} for languages in by_unit.values())
