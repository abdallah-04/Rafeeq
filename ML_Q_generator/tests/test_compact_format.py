import pytest

from rafeeq_qg.compact_format import CompactQuestion, format_compact_target, parse_compact_target


@pytest.mark.parametrize(
    "question",
    [
        CompactQuestion("ما ناتج 2 + 2؟", ("3", "4", "5", "6"), 2, "لأن 2 + 2 يساوي 4."),
        CompactQuestion("What is 2 + 2?", ("3", "4", "5", "6"), 2, "Because 2 + 2 equals 4."),
    ],
)
def test_compact_target_round_trips_in_arabic_and_english(question):
    assert parse_compact_target(format_compact_target(question)) == question


@pytest.mark.parametrize("correct", (1, 2, 3, 4))
def test_compact_target_supports_every_correct_option(correct):
    question = CompactQuestion("Question?", ("A1", "B1", "C1", "D1"), correct, "Explanation.")
    assert parse_compact_target(format_compact_target(question)).correct_option == correct


@pytest.mark.parametrize(
    "raw",
    [
        "<QUESTION> Q\n<OPTION_A> A\n<OPTION_B> B\n<OPTION_C> C\n<OPTION_D> D\n<CORRECT> E\n<EXPLANATION> X",
        "<QUESTION> Q\n<OPTION_A> A\n<OPTION_B> B\n<OPTION_C> C\n<CORRECT> A\n<EXPLANATION> X",
        "<extra_id_0>",
    ],
)
def test_compact_parser_rejects_malformed_missing_and_sentinel_targets(raw):
    with pytest.raises(ValueError):
        parse_compact_target(raw)
