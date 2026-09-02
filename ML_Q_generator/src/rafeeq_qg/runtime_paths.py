from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class RuntimePaths:
    models_dir: Path
    checkpoints_dir: Path
    outputs_dir: Path


def _first_env(*names: str) -> str | None:
    for name in names:
        value = os.environ.get(name)
        if value:
            return value
    return None


def _path_from_environment(names: tuple[str, ...], fallback: Path) -> Path:
    value = _first_env(*names)
    return Path(value).expanduser() if value else fallback


def resolve_runtime_paths(project_root: Path) -> RuntimePaths:
    """Resolve machine-local artifact directories without embedding machine paths in source.

    Preferred configuration is one RAFEEQ_ML_HOME environment variable. The older
    RAFREEQ_* variable names are accepted for backward compatibility with earlier
    experiment notes.
    """
    home_value = _first_env("RAFEEQ_ML_HOME", "RAFREEQ_ML_HOME")
    if home_value:
        home = Path(home_value).expanduser()
        default_models = home / "models"
        default_checkpoints = home / "checkpoints"
        default_outputs = home / "outputs"
    else:
        default_models = project_root / "models"
        default_checkpoints = project_root / "models" / "checkpoints"
        default_outputs = project_root / "outputs"

    return RuntimePaths(
        models_dir=_path_from_environment(("RAFEEQ_ML_MODELS_DIR", "RAFREEQ_ML_MODELS_DIR"), default_models),
        checkpoints_dir=_path_from_environment(("RAFEEQ_ML_CHECKPOINTS_DIR", "RAFREEQ_ML_CHECKPOINTS_DIR"), default_checkpoints),
        outputs_dir=_path_from_environment(("RAFEEQ_ML_OUTPUTS_DIR", "RAFREEQ_ML_OUTPUTS_DIR"), default_outputs),
    )
