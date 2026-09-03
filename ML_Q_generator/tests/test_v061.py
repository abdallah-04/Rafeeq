import inspect
from pathlib import Path

from rafeeq_qg.v061_formats import parse_question_only, parse_short, serialize_question_only, serialize_short
from rafeeq_qg.v061_hybrid import build_final, deterministic_options, retry_model, stable_position, verify_fact


def test_short_sentinel_round_trip_and_strictness():
    raw = serialize_short("What is this?", "It asks about the lesson.")
    assert parse_short(raw) == {"question": "What is this?", "explanation": "It asks about the lesson."}
    for bad in ("<extra_id_0> q <extra_id_1> e", "x <extra_id_0> q <extra_id_1> e <extra_id_2>", "<extra_id_0> q <extra_id_0> e <extra_id_2>"):
        try: parse_short(bad)
        except ValueError: pass
        else: raise AssertionError("invalid short target accepted")


def test_question_only_round_trip_and_wrapper_cleanup_contract():
    assert parse_question_only(serialize_question_only("Which shape?")) == {"question": "Which shape?"}
    try:
        parse_short("<pad> <extra_id_0> Q <extra_id_1> E <extra_id_2></s>")
    except ValueError:
        pass
    else:
        raise AssertionError("parser must receive wrapper-cleaned model text")


def test_unknown_fact_and_comparison_schema_are_rejected_or_verified():
    assert not verify_fact({"task_type": "ADDITION", "operation": "mystery", "answer": 5})
    assert verify_fact({"task_type": "COMPARISON", "operation": "compare", "left": 8, "right": 5, "relation": "greater", "answer": "8"})


def test_stable_position_and_bilingual_final_options():
    row = {"id": "v061-test", "subject": "LANGUAGE", "task_type": "WORD_RECOGNITION", "source_expected": {"answer": "book", "distractors": ["table", "book", "chair"]}}
    assert stable_position(row["id"]) == stable_position(row["id"])
    options, letter = deterministic_options(row)
    assert len(set(options)) == 4 and options[ord(letter) - 65] == "book"
    final = build_final({**row, "language": "en"}, {"question": "Which word?", "explanation": "The lesson uses book."})
    assert final["provenance"]["correct_answer"] == "CURRICULUM_FACT" and final["integrity"]["selected_answer_matches"]


def test_retry_retries_malformed_and_never_receives_target():
    seen = []
    def generate(beams):
        seen.append(beams)
        return "<extra_id_0> Q <extra_id_1> E <extra_id_2>" if beams == 2 else "bad"
    parsed, attempts, _ = retry_model(generate, {"language": "en"})
    assert parsed is not None and attempts == 2 and seen == [1, 2]
    assert "training_expected" not in inspect.signature(generate).parameters


def test_historical_v06_three_epoch_regression_is_preserved_and_v061_uses_short_target():
    root = Path(__file__).resolve().parents[1]
    historical = (root / "scripts" / "run_v06_generalization.py").read_text(encoding="utf-8")
    assert "for epoch in range(1, 4)" in historical
    builder = (root / "scripts" / "build_v061_dataset.py").read_text(encoding="utf-8")
    assert "short_sentinel_v061" in builder and "sentinel_native_v2" not in builder
