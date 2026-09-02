from rafeeq_qg.hybrid import deterministic_distractors, validated_output_acceptance, verify_math_fact


def test_math_fact_engine_and_distractors():
    assert verify_math_fact({"operation": "add", "operand_1": 3, "operand_2": 2, "answer": 5})
    assert verify_math_fact({"operation": "subtract", "operand_1": 7, "operand_2": 3, "answer": 4})
    options, letter = deterministic_distractors(5, 2)
    assert len(set(options)) == 4 and options[2] == "5" and letter == "C"


def test_acceptance_metric():
    assert validated_output_acceptance([{"accepted": True}, {"accepted": False}]) == 0.5
