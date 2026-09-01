from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from rafeeq_qg.config import PrototypeConfig
from rafeeq_qg.model import load_seq2seq_model
from rafeeq_qg.tokenizer_utils import structural_token_ids
from run_v03_sanity import (
    MODEL_PATH,
    OUTPUT_PATHS,
    first_step_diagnostic,
    label_audit,
    read_rows,
    write_json,
)


def main() -> None:
    rows = read_rows()
    tokenizer, model = load_seq2seq_model(MODEL_PATH, PrototypeConfig())
    model.to("cuda")
    old = json.loads(OUTPUT_PATHS["diagnostics"].read_text(encoding="utf-8"))
    old["extra_id_0"] = tokenizer.encode("<extra_id_0>", add_special_tokens=False)[0]
    old["label_audit"] = label_audit(rows, tokenizer)
    old["first_step_diagnostics"] = [
        first_step_diagnostic(model, tokenizer, rows[2]),
        first_step_diagnostic(model, tokenizer, rows[3]),
    ]
    old["structural_token_ids"] = dict(zip(
        ("<QUESTION>", "<OPTION_A>", "<OPTION_B>", "<OPTION_C>", "<OPTION_D>", "<CORRECT>", "<EXPLANATION>"),
        structural_token_ids(tokenizer),
    ))
    write_json(OUTPUT_PATHS["diagnostics"], old)
    print(json.dumps({
        "sentinel_ids": old["label_audit"]["sentinel_ids_checked"],
        "sentinel_ids_found_in_labels": old["label_audit"]["sentinel_ids_found_in_labels"],
        "parse_counts": old["parse_counts"],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
