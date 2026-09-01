from __future__ import annotations

import re
from pathlib import Path

from .compact_format import CompactQuestion, parse_compact_target
from .config import PrototypeConfig
from .curriculum_loader import load_curriculum
from .model import get_device, load_seq2seq_model
from .schemas import CurriculumUnit
from .tokenizer_utils import decode_preserving_structural_tokens, format_model_input

TOKEN_PATTERN = re.compile(r"[A-Za-z0-9\u0600-\u06FF]+")


class CompactModelGenerator:
    """MODEL MODE only: malformed compact output is returned as a failure, never repaired."""

    def __init__(self, curriculum_path: str | Path, model_path: str | Path, config: PrototypeConfig):
        self.metadata, self.units = load_curriculum(curriculum_path)
        self.config = config
        self.tokenizer, self.model = load_seq2seq_model(model_path, config)
        self.model.to(get_device())
        self.model.eval()

    def generate(self, unit: CurriculumUnit, language: str) -> dict:
        import torch

        condition = format_model_input(unit, language)
        inputs = self.tokenizer(condition, return_tensors="pt", truncation=True, max_length=self.config.max_input_length)
        inputs = {key: value.to(get_device()) for key, value in inputs.items()}
        with torch.no_grad():
            output_ids = self.model.generate(
                **inputs,
                max_new_tokens=self.config.max_new_tokens,
                do_sample=False,
                num_beams=2,
                early_stopping=True,
                repetition_penalty=1.1,
                no_repeat_ngram_size=3,
            )
        raw = decode_preserving_structural_tokens(self.tokenizer, output_ids[0])
        try:
            parsed = parse_compact_target(raw)
            return {
                "input_context": condition,
                "raw_model_output": raw,
                "parsed_output": self._attach_metadata(parsed, unit, language),
                "validation_result": "valid",
            }
        except ValueError as exc:
            return {
                "input_context": condition,
                "raw_model_output": raw,
                "parsed_output": None,
                "validation_result": "invalid",
                "failure_reason": str(exc),
                "source_unit_id": unit.unit_id,
                "target_level": unit.level,
                "language": language,
                "subject": unit.subject,
            }

    @staticmethod
    def _attach_metadata(question: CompactQuestion, unit: CurriculumUnit, language: str) -> dict:
        return {
            "source_unit_id": unit.unit_id,
            "target_level": unit.level,
            "language": language,
            "subject": unit.subject,
            "question": question.question,
            "options": list(question.options),
            "correct_option": question.correct_option,
            "explanation": question.explanation,
        }


def lexical_grounding_heuristic(parsed: dict, unit: CurriculumUnit, language: str) -> bool:
    source = (unit.topic_ar + " " + unit.content_ar) if language == "ar" else (unit.topic_en + " " + unit.content_en)
    generated = " ".join([parsed["question"], *parsed["options"], parsed["explanation"]])
    source_tokens = {token.casefold() for token in TOKEN_PATTERN.findall(source) if len(token) > 1}
    generated_tokens = {token.casefold() for token in TOKEN_PATTERN.findall(generated) if len(token) > 1}
    return bool(source_tokens & generated_tokens)
