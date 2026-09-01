from __future__ import annotations

import json
import random
from datetime import datetime, timezone
from pathlib import Path

from .config import PrototypeConfig
from .curriculum_loader import load_curriculum, select_units
from .model import get_device, load_seq2seq_model
from .schemas import CurriculumUnit, GeneratedQuestion
from .tokenizer_utils import format_model_input
from .validator import validate_question


class CurriculumGroundedGenerator:
    """Deterministic local fallback that only uses curriculum-provided answers and distractors."""

    def __init__(self, curriculum_id: str, seed: int = 42):
        self.curriculum_id = curriculum_id
        self.seed = seed

    def from_unit(self, unit: CurriculumUnit, variant: int) -> GeneratedQuestion:
        pairs = list(zip([unit.answer_ar, *unit.distractors_ar], [unit.answer_en, *unit.distractors_en]))
        rng = random.Random(f"{self.seed}:{unit.unit_id}:{variant}")
        rng.shuffle(pairs)
        correct_option = next(index + 1 for index, pair in enumerate(pairs) if pair == (unit.answer_ar, unit.answer_en))
        prompts = (
            (unit.prompt_ar, unit.prompt_en),
            (f"اختر الإجابة الصحيحة: {unit.prompt_ar}", f"Choose the correct answer: {unit.prompt_en}"),
            (f"تذكّر الدرس ثم أجب: {unit.prompt_ar}", f"Remember the lesson, then answer: {unit.prompt_en}"),
        )
        prompt_ar, prompt_en = prompts[variant % len(prompts)]
        return GeneratedQuestion(
            source_unit_id=unit.unit_id,
            subject=unit.subject,
            topic_ar=unit.topic_ar,
            topic_en=unit.topic_en,
            question_ar=prompt_ar,
            question_en=prompt_en,
            option_1_ar=pairs[0][0], option_1=pairs[0][1],
            option_2_ar=pairs[1][0], option_2=pairs[1][1],
            option_3_ar=pairs[2][0], option_3=pairs[2][1],
            option_4_ar=pairs[3][0], option_4=pairs[3][1],
            correct_option=correct_option,
            explanation_ar=f"الإجابة الصحيحة هي {unit.answer_ar}. {unit.content_ar}",
            explanation_en=f"The correct answer is {unit.answer_en}. {unit.content_en}",
            target_level=unit.level,
        )


class LocalQuestionGenerator:
    """Generate in explicitly selected fallback or trained-model mode."""

    def __init__(
        self,
        curriculum_path: str | Path,
        model_path: str | Path | None = None,
        config: PrototypeConfig | None = None,
        mode: str = "fallback",
    ):
        self.metadata, self.units = load_curriculum(curriculum_path)
        self.config = config or PrototypeConfig()
        self.fallback = CurriculumGroundedGenerator(self.metadata["curriculum_id"], self.config.seed)
        self.model_path = Path(model_path) if model_path else None
        if mode not in {"fallback", "model"}:
            raise ValueError("mode must be 'fallback' or 'model'")
        self.mode = mode
        self.tokenizer = self.model = None
        if self.mode == "model":
            if not self.model_path or not self.model_path.exists():
                raise RuntimeError("MODEL MODE requires an existing local trained model directory")
            self.tokenizer, self.model = load_seq2seq_model(self.model_path, self.config)
            self.model.to(get_device())
            self.model.eval()

    def generate(
        self,
        level: int,
        num_questions: int,
        subject: str | None = None,
        unit_id: str | None = None,
        sampling: bool = False,
    ) -> dict:
        if not 3 <= num_questions <= 10:
            raise ValueError("num_questions must be between 3 and 10")
        candidates = select_units(self.units, level, subject, unit_id)
        known_ids = {unit.unit_id for unit in self.units}
        seen: set[tuple[str, str]] = set()
        questions: list[GeneratedQuestion] = []
        failures: list[dict] = []
        for index in range(num_questions):
            unit = candidates[index % len(candidates)]
            if self.mode == "fallback":
                question = self.fallback.from_unit(unit, index)
                failure = None
            else:
                question, failure = self._generate_for_unit(unit, index, known_ids, seen, sampling)
            if failure is not None:
                failures.append(failure)
                continue
            assert question is not None
            errors = validate_question(question, known_ids, seen)
            if errors:
                failures.append(self._failure(unit, index, "; ".join(errors)))
                continue
            seen.add((question.question_ar, question.question_en))
            questions.append(question)
        return {
            "model_version": "rafeeq-qg-v0.1",
            "curriculum_id": self.metadata["curriculum_id"],
            "target_level": level,
            "generation_mode": self.mode,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "attempted_questions": num_questions,
            "questions": [question.as_dict() for question in questions],
            "failures": failures,
        }

    def _generate_for_unit(
        self,
        unit: CurriculumUnit,
        variant: int,
        known_ids: set[str],
        seen: set[tuple[str, str]],
        sampling: bool,
    ) -> tuple[GeneratedQuestion | None, dict | None]:
        last_reason = "model did not return a parseable question"
        last_raw = ""
        for attempt in range(self.config.max_retries + 1):
            generated, raw, parse_error = self._generate_with_model(unit, variant + attempt, sampling)
            last_raw = raw
            if parse_error:
                last_reason = parse_error
                continue
            assert generated is not None
            errors = validate_question(generated, known_ids, seen)
            if generated.source_unit_id != unit.unit_id:
                errors.append("source_unit_id does not match the supplied curriculum unit")
            if generated.target_level != unit.level:
                errors.append("target_level does not match the supplied curriculum unit")
            if not errors:
                return generated, None
            last_reason = "; ".join(errors)
        return None, self._failure(unit, variant, last_reason, last_raw)

    def _generate_with_model(self, unit: CurriculumUnit, seed_offset: int, sampling: bool) -> tuple[GeneratedQuestion | None, str, str | None]:
        import torch

        inputs = self.tokenizer(format_model_input(unit), return_tensors="pt", truncation=True, max_length=self.config.max_input_length)
        inputs = {name: value.to(get_device()) for name, value in inputs.items()}
        generation_args = {"max_new_tokens": self.config.max_new_tokens, "do_sample": sampling}
        if sampling:
            seed = self.config.seed + seed_offset
            torch.manual_seed(seed)
            if get_device() == "cuda":
                torch.cuda.manual_seed_all(seed)
            generation_args.update({"top_p": 0.92, "temperature": 0.8})
        else:
            generation_args["num_beams"] = 1
        with torch.no_grad():
            output_ids = self.model.generate(**inputs, **generation_args)
        raw = self.tokenizer.decode(output_ids[0], skip_special_tokens=True)
        try:
            payload = json.loads(raw)
            return GeneratedQuestion(**payload), raw, None
        except (json.JSONDecodeError, TypeError, ValueError) as exc:
            return None, raw, f"model output is not a valid structured question: {exc}"

    @staticmethod
    def _failure(unit: CurriculumUnit, attempt: int, reason: str, raw_output: str = "") -> dict:
        return {
            "source_unit_id": unit.unit_id,
            "target_level": unit.level,
            "attempt": attempt + 1,
            "reason": reason,
            "raw_output": raw_output[:1000],
        }
