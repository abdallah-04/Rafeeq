from rafeeq_qg.hybrid import accept_v06_output, apply_math_hybrid, retry_language


def test_math_hybrid_replaces_only_answer_fields_from_verified_fact():
    row = {
        "subject": "MATH", "language": "en",
        "fact_payload": {"operation": "add", "operand_1": 3, "operand_2": 2, "answer": 5},
        "training_expected": {"correct_option": 3},
    }
    parsed = {"question": "What is 3 + 2?", "options": ["1", "2", "9", "8"], "correct_letter": "A", "explanation": "bad"}
    repaired = apply_math_hybrid(row, parsed)
    assert repaired["question"] == parsed["question"]
    assert repaired["options"][2] == "5" and repaired["correct_letter"] == "C"
    assert accept_v06_output(row, parsed, hybrid=repaired)["accepted"]


def test_language_retry_has_at_most_three_same_input_attempts():
    calls = []
    def generate():
        calls.append(True)
        return None if len(calls) < 3 else {"question": "x", "options": ["a", "b", "c", "d"], "correct_letter": "A", "explanation": "x"}
    parsed, attempts = retry_language(generate)
    assert parsed is not None and attempts == 3 and len(calls) == 3
