from pathlib import Path

from rafeeq_qg.runtime_paths import resolve_runtime_paths


def test_runtime_home_preferred_name(monkeypatch, tmp_path):
    home = tmp_path / "runtime"
    monkeypatch.setenv("RAFEEQ_ML_HOME", str(home))
    paths = resolve_runtime_paths(tmp_path / "project")
    assert paths.models_dir == home / "models"
    assert paths.checkpoints_dir == home / "checkpoints"
    assert paths.outputs_dir == home / "outputs"


def test_runtime_legacy_variable_still_supported(monkeypatch, tmp_path):
    monkeypatch.delenv("RAFEEQ_ML_HOME", raising=False)
    legacy = tmp_path / "legacy_models"
    monkeypatch.setenv("RAFREEQ_ML_MODELS_DIR", str(legacy))
    paths = resolve_runtime_paths(tmp_path / "project")
    assert paths.models_dir == legacy
