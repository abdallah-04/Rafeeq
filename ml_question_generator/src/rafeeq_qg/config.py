from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class PrototypeConfig:
    model_name: str = "google/mt5-small"
    model_output_name: str = "rafeeq-mt5-qg-v0.1-fp32"
    seed: int = 42
    max_input_length: int = 512
    max_target_length: int = 512
    epochs: int = 5
    learning_rate: float = 5e-5
    train_batch_size: int = 1
    eval_batch_size: int = 1
    gradient_accumulation_steps: int = 4
    early_stopping_patience: int = 1
    fp16: bool = False
    max_retries: int = 2
    max_new_tokens: int = 512


def project_root() -> Path:
    return Path(__file__).resolve().parents[2]


def load_config(path: str | Path | None = None) -> PrototypeConfig:
    config_path = Path(path) if path else project_root() / "config.yaml"
    if not config_path.exists():
        return PrototypeConfig()
    try:
        import yaml

        raw = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
    except ModuleNotFoundError:
        return PrototypeConfig()
    return PrototypeConfig(
        model_name=raw.get("model", {}).get("name", PrototypeConfig.model_name),
        model_output_name=raw.get("model", {}).get("output_name", PrototypeConfig.model_output_name),
        seed=raw.get("project", {}).get("seed", PrototypeConfig.seed),
        max_input_length=raw.get("model", {}).get("max_input_length", PrototypeConfig.max_input_length),
        max_target_length=raw.get("model", {}).get("max_target_length", PrototypeConfig.max_target_length),
        epochs=raw.get("training", {}).get("epochs", PrototypeConfig.epochs),
        learning_rate=raw.get("training", {}).get("learning_rate", PrototypeConfig.learning_rate),
        train_batch_size=raw.get("training", {}).get("train_batch_size", PrototypeConfig.train_batch_size),
        eval_batch_size=raw.get("training", {}).get("eval_batch_size", PrototypeConfig.eval_batch_size),
        gradient_accumulation_steps=raw.get("training", {}).get("gradient_accumulation_steps", PrototypeConfig.gradient_accumulation_steps),
        early_stopping_patience=raw.get("training", {}).get("early_stopping_patience", PrototypeConfig.early_stopping_patience),
        fp16=raw.get("training", {}).get("fp16", PrototypeConfig.fp16),
        max_retries=raw.get("generation", {}).get("max_retries", PrototypeConfig.max_retries),
        max_new_tokens=raw.get("generation", {}).get("max_new_tokens", PrototypeConfig.max_new_tokens),
    )
