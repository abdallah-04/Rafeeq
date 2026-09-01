from __future__ import annotations

import sys
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from rafeeq_qg.config import load_config
from rafeeq_qg.trainer import train


def main() -> None:
    result = train(ROOT / "data", ROOT / "models", load_config(ROOT / "config.yaml"))
    metrics_path = ROOT / "outputs" / "training_metrics.json"
    metrics_path.write_text(json.dumps(result.as_dict(), indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result.as_dict(), indent=2))


if __name__ == "__main__":
    main()
