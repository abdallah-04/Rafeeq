from pathlib import Path

import pytest
from transformers import AutoTokenizer

from rafeeq_qg.compact_format import parse_compact_target
from rafeeq_qg.curriculum_loader import load_curriculum
from rafeeq_qg.tokenizer_utils import (
    STRUCTURAL_TOKENS,
    decode_preserving_structural_tokens,
    ensure_structural_tokens,
    format_model_input,
    sentinel_bad_words_ids,
)


def _tokenizer():
    return AutoTokenizer.from_pretrained("google/mt5-small", use_fast=False)


def test_training_prompt_has_explicit_language_level_subject_and_context():
    root = Path(__file__).resolve().parents[1]
    _, units = load_curriculum(root / "data" / "curriculum_demo.json")
    unit = units[0]
    for condition, language, topic, content in (
        (format_model_input(unit, "ar"), "ar", unit.topic_ar, unit.content_ar),
        (format_model_input(unit, "en"), "en", unit.topic_en, unit.content_en),
    ):
        assert "task=generate_mcq" in condition
        assert f"language={language}" in condition
        assert f"level={unit.level}" in condition
        assert f"subject={unit.subject}" in condition
        assert f"topic={topic}" in condition
        assert f"content={content}" in condition
        assert "source_unit_id" not in condition


def test_legacy_model_input_call_defaults_to_english():
    root = Path(__file__).resolve().parents[1]
    _, units = load_curriculum(root / "data" / "curriculum_demo.json")
    unit = units[0]
    assert format_model_input(unit) == format_model_input(unit, "en")


def test_structural_tags_become_single_tokens_after_registration():
    tokenizer = _tokenizer()
    added = ensure_structural_tokens(tokenizer)
    assert added == len(STRUCTURAL_TOKENS)
    for tag in STRUCTURAL_TOKENS:
        ids = tokenizer(tag, add_special_tokens=False).input_ids
        assert len(ids) == 1
        assert decode_preserving_structural_tokens(tokenizer, ids) == tag


def test_parser_sees_structural_tags_after_decode():
    tokenizer = _tokenizer()
    ensure_structural_tokens(tokenizer)
    raw = "\n".join([
        "<QUESTION> Q",
        "<OPTION_A> A",
        "<OPTION_B> B",
        "<OPTION_C> C",
        "<OPTION_D> D",
        "<CORRECT> A",
        "<EXPLANATION> X",
    ])
    ids = tokenizer(raw, add_special_tokens=False).input_ids
    decoded = decode_preserving_structural_tokens(tokenizer, ids)
    parsed = parse_compact_target(decoded)
    assert parsed.question == "Q"
    assert parsed.options == ("A", "B", "C", "D")
    assert parsed.correct_option == 1
    assert parsed.explanation == "X"


def test_sentinel_bad_words_ids_match_mtg_sentinel_tokens():
    tokenizer = _tokenizer()
    bad_words = sentinel_bad_words_ids(tokenizer, limit=3)
    assert bad_words == [tokenizer.encode(f"<extra_id_{index}>", add_special_tokens=False) for index in range(3)]
    assert all(len(ids) == 1 for ids in bad_words)


def test_registered_structural_tokens_survive_tokenizer_save_and_reload(tmp_path):
    tokenizer = _tokenizer()
    ensure_structural_tokens(tokenizer)
    tokenizer.save_pretrained(tmp_path)
    reloaded = AutoTokenizer.from_pretrained(tmp_path, use_fast=False)
    for tag in STRUCTURAL_TOKENS:
        assert reloaded.convert_tokens_to_ids(tag) == tokenizer.convert_tokens_to_ids(tag)
        ids = reloaded(tag, add_special_tokens=False).input_ids
        assert decode_preserving_structural_tokens(reloaded, ids) == tag
