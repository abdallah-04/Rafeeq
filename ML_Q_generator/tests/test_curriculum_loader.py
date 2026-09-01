from pathlib import Path

from rafeeq_qg.curriculum_loader import load_curriculum


def test_demo_curriculum_has_all_levels_subjects_and_topics():
    root = Path(__file__).resolve().parents[1]
    metadata, units = load_curriculum(root / "data" / "curriculum_demo.json")
    assert metadata["data_status"] == "DEMO / PROTOTYPE EDUCATIONAL DATA"
    assert len(units) >= 24
    assert {unit.level for unit in units} == {1, 2, 3}
    for level in (1, 2, 3):
        for subject in ("MATH", "LANGUAGE"):
            assert len([unit for unit in units if unit.level == level and unit.subject == subject]) >= 4
