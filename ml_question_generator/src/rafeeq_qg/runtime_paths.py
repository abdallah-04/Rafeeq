from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class RuntimePaths:
    models_dir: Path
    checkpoints_dir: Path
    outputs_dir: Path


def _path_from_environment(name: str, fallback: Path) -> Path:
    return Path(os.environ.get(name, fallback)).expanduser()


def resolve_runtime_paths(project_root: Path) -> RuntimePaths:
    """Resolve optional machine-local artifact directories without embedding machine paths in source."""
    return RuntimePaths(
        models_dir=_path_from_environment("RAFREEQ_ML_MODELS_DIR", project_root / "models"),
        checkpoints_dir=_path_from_environment("RAFREEQ_ML_CHECKPOINTS_DIR", project_root / "models" / "checkpoints"),
        outputs_dir=_path_from_environment("RAFREEQ_ML_OUTPUTS_DIR", project_root / "outputs"),
    )
