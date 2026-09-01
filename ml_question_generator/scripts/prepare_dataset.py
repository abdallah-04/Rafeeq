from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from rafeeq_qg.dataset_builder import write_splits


def main() -> None:
    counts = write_splits(ROOT / "data" / "curriculum_demo.json", ROOT / "data")
    print(f"Prepared demo dataset: {counts}")


if __name__ == "__main__":
    main()
