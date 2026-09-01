from __future__ import annotations

import json

from .schemas import CurriculumUnit, GeneratedQuestion


def format_model_input(unit: CurriculumUnit) -> str:
    return "\n".join([
        "task=generate_mcq",
        f"level={unit.level}",
        f"subject={unit.subject}",
        f"source_unit_id={unit.unit_id}",
        f"topic_ar={unit.topic_ar}",
        f"topic_en={unit.topic_en}",
        f"content_ar={unit.content_ar}",
        f"content_en={unit.content_en}",
    ])


def format_model_target(question: GeneratedQuestion) -> str:
    return json.dumps(question.as_dict(), ensure_ascii=False, sort_keys=True)
