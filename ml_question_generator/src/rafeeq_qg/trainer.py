from __future__ import annotations

import json
import random
import inspect
from dataclasses import asdict, dataclass
from pathlib import Path

from .config import PrototypeConfig
from .model import get_device, load_seq2seq_model


def _read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


@dataclass(frozen=True)
class TrainingResult:
    model_dir: Path
    epochs_completed: float
    training_loss: float | None
    validation_loss: float | None
    best_checkpoint: str | None

    def as_dict(self) -> dict:
        data = asdict(self)
        data["model_dir"] = str(self.model_dir)
        return data


def train(data_dir: str | Path, output_dir: str | Path, config: PrototypeConfig) -> TrainingResult:
    try:
        import torch
        from datasets import Dataset
        from transformers import DataCollatorForSeq2Seq, EarlyStoppingCallback, Seq2SeqTrainer, Seq2SeqTrainingArguments
    except ModuleNotFoundError as exc:
        raise RuntimeError("Install requirements.txt before training") from exc
    random.seed(config.seed)
    torch.manual_seed(config.seed)
    rows = _read_jsonl(Path(data_dir) / "train.jsonl")
    eval_rows = _read_jsonl(Path(data_dir) / "validation.jsonl")
    tokenizer, model = load_seq2seq_model(config.model_name, config)
    model.config.use_cache = False
    if get_device() == "cuda":
        model.gradient_checkpointing_enable()

    def tokenize(row):
        model_inputs = tokenizer(row["input"]["condition"], max_length=config.max_input_length, truncation=True)
        target = json.dumps(row["target"], ensure_ascii=False)
        model_inputs["labels"] = tokenizer(text_target=target, max_length=config.max_target_length, truncation=True)["input_ids"]
        return model_inputs

    train_dataset = Dataset.from_list(rows).map(tokenize, remove_columns=list(rows[0].keys()))
    eval_dataset = Dataset.from_list(eval_rows).map(tokenize, remove_columns=list(eval_rows[0].keys()))
    destination = Path(output_dir)
    training_args = {
        "output_dir": str(destination / "checkpoints"),
        "num_train_epochs": config.epochs,
        "learning_rate": config.learning_rate,
        "per_device_train_batch_size": config.train_batch_size,
        "per_device_eval_batch_size": config.eval_batch_size,
        "gradient_accumulation_steps": config.gradient_accumulation_steps,
        "save_strategy": "epoch",
        "load_best_model_at_end": True,
        "metric_for_best_model": "eval_loss",
        "greater_is_better": False,
        "save_total_limit": 2,
        "seed": config.seed,
        "report_to": [],
        "use_cpu": get_device() == "cpu",
        "fp16": get_device() == "cuda",
    }
    # Transformers renamed this parameter; support the declared compatible range.
    evaluation_parameter = "eval_strategy" if "eval_strategy" in inspect.signature(Seq2SeqTrainingArguments).parameters else "evaluation_strategy"
    training_args[evaluation_parameter] = "epoch"
    args = Seq2SeqTrainingArguments(
        **training_args,
    )
    trainer = Seq2SeqTrainer(
        model=model,
        args=args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        data_collator=DataCollatorForSeq2Seq(tokenizer=tokenizer, model=model),
        callbacks=[EarlyStoppingCallback(early_stopping_patience=config.early_stopping_patience)],
    )
    train_result = trainer.train()
    model_dir = destination / "rafeeq-mt5-qg-v0.1"
    trainer.save_model(str(model_dir))
    tokenizer.save_pretrained(str(model_dir))
    eval_losses = [entry["eval_loss"] for entry in trainer.state.log_history if "eval_loss" in entry]
    completed_epochs = max((float(entry["epoch"]) for entry in trainer.state.log_history if "epoch" in entry), default=0.0)
    return TrainingResult(
        model_dir=model_dir,
        epochs_completed=completed_epochs,
        training_loss=float(train_result.training_loss) if train_result.training_loss is not None else None,
        validation_loss=float(eval_losses[-1]) if eval_losses else None,
        best_checkpoint=trainer.state.best_model_checkpoint,
    )
