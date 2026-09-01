from rafeeq_qg.diagnostics import summarize_rows


def test_unique_condition_count_and_conflicting_targets_are_reported():
    rows = [
        {
            "input": {"condition": "task=generate_mcq\nlanguage=en\nlevel=1"},
            "target": "<QUESTION> Q1\n<OPTION_A> A\n<OPTION_B> B\n<OPTION_C> C\n<OPTION_D> D\n<CORRECT> A\n<EXPLANATION> X",
            "curriculum_unit_id": "unit-1",
            "level": 1,
            "subject": "MATH",
            "language": "en",
        },
        {
            "input": {"condition": "task=generate_mcq\nlanguage=en\nlevel=1"},
            "target": "<QUESTION> Q2\n<OPTION_A> A\n<OPTION_B> B\n<OPTION_C> C\n<OPTION_D> D\n<CORRECT> B\n<EXPLANATION> Y",
            "curriculum_unit_id": "unit-1",
            "level": 1,
            "subject": "MATH",
            "language": "en",
        },
        {
            "input": {"condition": "task=generate_mcq\nlanguage=ar\nlevel=2"},
            "target": "<QUESTION> Q3\n<OPTION_A> A\n<OPTION_B> B\n<OPTION_C> C\n<OPTION_D> D\n<CORRECT> C\n<EXPLANATION> Z",
            "curriculum_unit_id": "unit-2",
            "level": 2,
            "subject": "LANGUAGE",
            "language": "ar",
        },
    ]

    summary = summarize_rows(rows)

    assert summary["total_rows"] == 3
    assert summary["unique_input_conditions"] == 2
    assert summary["inputs_with_multiple_distinct_targets"] == 1
    assert summary["maximum_targets_per_identical_input"] == 2
    assert summary["targets_per_identical_input_distribution"] == {1: 1, 2: 1}
    assert summary["exact_duplicate_input_count"] == 1
