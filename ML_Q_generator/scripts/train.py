from __future__ import annotations

import sys
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from rafeeq_qg.config import load_config
from rafeeq_qg.runtime_paths import resolve_runtime_paths
from rafeeq_qg.trainer import train


def main() -> None:
    paths = resolve_runtime_paths(ROOT)
    result = train(ROOT / "data", paths.models_dir, paths.checkpoints_dir, load_config(ROOT / "config.yaml"))
    paths.outputs_dir.mkdir(parents=True, exist_ok=True)
    metrics_path = paths.outputs_dir / "training_metrics.json"
    metrics_path.write_text(json.dumps(result.as_dict(), indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result.as_dict(), indent=2))


if __name__ == "__main__":
    main()
