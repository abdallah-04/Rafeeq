from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

from rafeeq_qg.v04_evaluation import aggregate_results, evaluate_raw_output, validation_rank
from rafeeq_qg.v04_formats import parse_sentinel

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / "data" / "v04_final" / "rafeeq_v04_final_master.jsonl"


def rows() -> list[dict]:
    return [json.loads(line) for line in MASTER.read_text(encoding="utf-8").splitlines() if line.strip()]


def test_v04_final_frozen_counts_and_no_leakage():
    data = rows()
    assert len(data) == 72
    assert len({row["input_condition"] for row in data}) == 72
    assert Counter(row["historical_split"] for row in data) == {"train": 60, "validation": 6, "test": 6}
    for unit in {row["curriculum_unit_id"] for row in data}:
        unit_rows = [row for row in data if row["curriculum_unit_id"] == unit]
        assert len(unit_rows) == 2
        assert {row["language"] for row in unit_rows} == {"ar", "en"}
        assert len({row["historical_split"] for row in unit_rows}) == 1


def test_v04_final_correct_letter_balance_includes_all_letters_in_test():
    data = rows()
    expected = {
        "train": {"A": 15, "B": 15, "C": 15, "D": 15},
        "validation": {"A": 2, "B": 1, "C": 2, "D": 1},
        "test": {"A": 1, "B": 2, "C": 1, "D": 2},
    }
    for split, target in expected.items():
        counts = Counter(row["training_expected"]["correct_letter"] for row in data if row["historical_split"] == split)
        assert dict(counts) == target
    assert Counter(row["training_expected"]["correct_letter"] for row in data) == {"A": 18, "B": 18, "C": 18, "D": 18}


def test_v04_final_active_target_strictly_parses():
    for row in rows():
        parsed = parse_sentinel(row["targets"]["sentinel_native_v2"])
        assert parsed == {
            "question": row["training_expected"]["question"],
            "options": row["training_expected"]["options"],
            "correct_letter": row["training_expected"]["correct_letter"],
            "explanation": row["training_expected"]["explanation"],
        }


def test_strict_sentinel_parser_rejects_extra_or_duplicate_terminal():
    row = rows()[0]
    target = row["targets"]["sentinel_native_v2"]
    for bad in (target + " <extra_id_8>", target + " <extra_id_7>"):
        try:
            parse_sentinel(bad)
        except ValueError:
            pass
        else:
            raise AssertionError("strict parser accepted unexpected sentinel structure")


def test_v04_evaluation_answer_consistency_and_validation_rank():
    row = rows()[0]
    result = evaluate_raw_output(row, row["targets"]["sentinel_native_v2"])
    assert result["strict_parse"]
    assert result["answer_consistent"]
    assert result["expected_answer_present"]
    assert result["language_pass"]
    assert result["exact_field_matches"] == 7
    metrics = aggregate_results([result])
    assert metrics["strict_parse_count"] == 1
    assert metrics["answer_consistency_count"] == 1
    assert validation_rank(metrics, 1.0) > validation_rank({**metrics, "strict_parse_count": 0}, 0.1)
