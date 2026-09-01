from __future__ import annotations

from pathlib import Path

from .config import PrototypeConfig
from .tokenizer_utils import ensure_structural_tokens


def get_device() -> str:
    try:
        import torch

        return "cuda" if torch.cuda.is_available() else "cpu"
    except ModuleNotFoundError:
        return "cpu"


def load_seq2seq_model(model_name_or_path: str | Path, config: PrototypeConfig):
    try:
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    except ModuleNotFoundError as exc:
        raise RuntimeError("Install requirements.txt before using the Transformer model path") from exc
    tokenizer = AutoTokenizer.from_pretrained(str(model_name_or_path), use_fast=False)
    added_tokens = ensure_structural_tokens(tokenizer)
    model = AutoModelForSeq2SeqLM.from_pretrained(str(model_name_or_path))
    if added_tokens:
        model.resize_token_embeddings(len(tokenizer))
    return tokenizer, model
