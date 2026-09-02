from rafeeq_qg.v04_formats import parse_plain, parse_sentinel, serialize_plain, serialize_sentinel


def row():
    return {"training_expected": {"question": "What?", "options": ["1", "2", "3", "4"], "correct_letter": "C", "explanation": "Because."}}


def test_v04_serializers_and_parsers():
    assert parse_sentinel(serialize_sentinel(row()))["correct_letter"] == "C"
    assert parse_plain(serialize_plain(row()))["options"] == ["1", "2", "3", "4"]


def test_v04_sentinel_requires_terminal_and_order():
    import pytest
    with pytest.raises(ValueError):
        parse_sentinel("<extra_id_1> x <extra_id_0> q <extra_id_2> b <extra_id_3> c <extra_id_4> d <extra_id_5> A <extra_id_6> e")
