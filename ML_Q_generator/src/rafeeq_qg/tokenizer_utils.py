from __future__ import annotations

import re
from collections.abc import Iterable, Sequence

from .schemas import CurriculumUnit
from .compact_format import TAGS

STRUCTURAL_TOKENS = tuple(f"<{tag}>" for tag in TAGS)
_STRUCTURAL_LINE_PATTERN = re.compile(r"\s+(<QUESTION>|<OPTION_A>|<OPTION_B>|<OPTION_C>|<OPTION_D>|<CORRECT>|<EXPLANATION>)")


def format_model_input(unit: CurriculumUnit, language: str = "en") -> str:
    if language not in {"ar", "en"}:
        raise ValueError("language must be ar or en")
    topic = unit.topic_ar if language == "ar" else unit.topic_en
    content = unit.content_ar if language == "ar" else unit.content_en
    return "\n".join([
        "task=generate_mcq",
        f"language={language}",
        f"level={unit.level}",
        f"subject={unit.subject}",
        f"topic={topic}",
        f"content={content}",
    ])


def ensure_structural_tokens(tokenizer) -> int:
    """Register Rafeeq structural tags as dedicated special tokens when needed."""
    return tokenizer.add_special_tokens({"additional_special_tokens": list(STRUCTURAL_TOKENS)})


def structural_token_ids(tokenizer) -> list[int]:
    return [tokenizer.convert_tokens_to_ids(token) for token in STRUCTURAL_TOKENS]


def sentinel_bad_words_ids(tokenizer, limit: int = 100) -> list[list[int]]:
    """Build generation constraints for mT5 sentinel tokens."""
    bad_words: list[list[int]] = []
    for index in range(limit):
        ids = tokenizer.encode(f"<extra_id_{index}>", add_special_tokens=False)
        if ids:
            bad_words.append(ids)
    return bad_words


def _flatten_token_ids(token_ids: Sequence[int] | Iterable[int]) -> list[int]:
    if hasattr(token_ids, "tolist"):
        token_ids = token_ids.tolist()
    if token_ids and isinstance(token_ids, list) and token_ids and isinstance(token_ids[0], list):
        token_ids = token_ids[0]
    return [int(token_id) for token_id in token_ids]


def decode_preserving_structural_tokens(tokenizer, token_ids: Sequence[int] | Iterable[int]) -> str:
    """Decode generated ids while stripping padding/eos markers but preserving Rafeeq tags."""
    ids = _flatten_token_ids(token_ids)
    excluded = {tokenizer.pad_token_id, tokenizer.eos_token_id}
    decoder_start_id = getattr(tokenizer, "decoder_start_token_id", None)
    if decoder_start_id is not None:
        excluded.add(decoder_start_id)
    filtered = [token_id for token_id in ids if token_id not in excluded and token_id != -100]
    decoded = tokenizer.decode(filtered, skip_special_tokens=False, clean_up_tokenization_spaces=False)
    decoded = _STRUCTURAL_LINE_PATTERN.sub(r"\n\1", decoded).strip()
    return re.sub(r"\n{3,}", "\n\n", decoded)
