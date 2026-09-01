from types import SimpleNamespace

from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

from rafeeq_qg.config import PrototypeConfig
from rafeeq_qg.model import load_seq2seq_model
from rafeeq_qg.tokenizer_utils import STRUCTURAL_TOKENS


def test_load_seq2seq_model_resizes_embeddings_when_structural_tokens_are_added(monkeypatch):
    tokenizer = AutoTokenizer.from_pretrained("google/mt5-small", use_fast=False)
    original_length = len(tokenizer)

    class DummyModel:
        def __init__(self):
            self.resized_to = None
            self.config = SimpleNamespace()

        def resize_token_embeddings(self, size):
            self.resized_to = size
            return self

    dummy_model = DummyModel()
    monkeypatch.setattr(AutoTokenizer, "from_pretrained", lambda *args, **kwargs: tokenizer)
    monkeypatch.setattr(AutoModelForSeq2SeqLM, "from_pretrained", lambda *args, **kwargs: dummy_model)

    loaded_tokenizer, loaded_model = load_seq2seq_model("ignored", PrototypeConfig())

    assert loaded_tokenizer is tokenizer
    assert loaded_model is dummy_model
    assert loaded_model.resized_to == original_length + len(STRUCTURAL_TOKENS)
    assert len(loaded_tokenizer) == original_length + len(STRUCTURAL_TOKENS)
