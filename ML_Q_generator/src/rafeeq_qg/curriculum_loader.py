from __future__ import annotations

import json
from pathlib import Path

from .schemas import CurriculumUnit


def load_curriculum(path: str | Path) -> tuple[dict, list[CurriculumUnit]]:
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    if raw.get("data_status") != "DEMO / PROTOTYPE EDUCATIONAL DATA":
        raise ValueError("Curriculum must be marked as demo/prototype educational data")
    units = [CurriculumUnit.from_dict(unit) for unit in raw.get("units", [])]
    if not units:
        raise ValueError("Curriculum contains no units")
    if len({unit.unit_id for unit in units}) != len(units):
        raise ValueError("Curriculum unit IDs must be unique")
    return raw, units


def select_units(units: list[CurriculumUnit], level: int, subject: str | None = None, unit_id: str | None = None) -> list[CurriculumUnit]:
    if level not in {1, 2, 3}:
        raise ValueError("target level must be 1, 2, or 3")
    selected = [unit for unit in units if unit.level == level]
    if subject:
        selected = [unit for unit in selected if unit.subject == subject.upper()]
    if unit_id:
        selected = [unit for unit in selected if unit.unit_id == unit_id]
    if not selected:
        raise ValueError("No curriculum units match the requested filters")
    return selected
