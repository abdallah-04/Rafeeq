# Rafeeq Local Question Generator Prototype

Standalone local ML research prototype for curriculum-grounded Arabic/English MCQ generation. It is intentionally isolated from the production Rafeeq application.

## Current status: v0.6 hybrid generalization experiment

v0.6 is the active controlled experiment. It preserves the frozen v0.5 high-quality conditions as a 480-condition dataset rather than fabricating scale, adds explicit task types and verified math fact payloads, and uses a hybrid acceptance pipeline: the model generates the question and language, while verified curriculum facts and deterministic distractors control math correctness. The official v0.6 hidden test is family-disjoint and does not reuse the v0.5 test family.

The v0.6 dataset audit is stored in `data/v06/dataset_statistics_v06.json`. The v0.5 failure taxonomy is stored externally at `D:\RafeeqML\outputs\v06_v05_failure_analysis.json`.

The completed v0.6 run used fresh seeds 42, 43, and 44, native mT5 sentinels, FP32 Adafactor at `1e-3`, validation-only checkpoint selection, and delayed hidden-test access. The final report is `D:\RafeeqML\outputs\v06_final_experiment_summary.json`. Raw model metrics and hybrid acceptance metrics are reported separately; the hybrid layer is not evidence that the model learned arithmetic.

## Historical v0.5 status

v0.5 expanded the curriculum to 240 concept units and 480 unique paired language conditions. Its artifacts remain frozen and historical for v0.6 analysis.

The v0.5 dataset audit is stored in `data/v05/dataset_statistics_v05.json`. Training and final evaluation are offline only; no production integration is authorized.

Historical progression:

- v0.1: long bilingual structured targets failed autoregressive parsing.
- v0.2: duplicated inputs with conflicting targets made supervision inconsistent.
- v0.3: custom structural tags did not overcome mT5's sentinel prior.
- v0.4: native sentinels plus Adafactor passed micro memorization and reached 11/12 on the sanity set, but held-out generalization remained weak.
- v0.5: expands curriculum coverage and evaluates generalization with three fresh seeds and a newly frozen hidden test.

The active model path is:

- Base model: `google/mt5-small`
- Output grammar: mT5 native sentinels (`<extra_id_0>` ... `<extra_id_7>`)
- Optimizer: Adafactor
- Learning rate: `1e-3`
- Precision: FP32
- GPU target: RTX 2070 SUPER

Controlled checks already completed on the user's training machine:

- v0.4 micro comparison: **Sentinel Native + Adafactor** was the only configuration to reach genuine `2/2` autoregressive memorization.
- v0.4 12-example sanity: **11/12** strict parse + exact-content reproduction.

Those results establish pipeline/memorization sanity only. They are not held-out generalization, educational validity, clinical validity, or production readiness.

## Historical v0.4 frozen dataset

The v0.4 snapshot is historical only. The active v0.6 run uses:

`data/v06/`

The historical v0.4 experiment used:

`data/v04_final/`

`data/v04_final/`

for the next held-out experiment.

The snapshot contains:

- `rafeeq_v04_final_master.jsonl` — 72 unique unit+language conditions.
- `rafeeq_v04_final_split_manifest.json` — frozen split membership.
- `curriculum_v04_final.json` — metadata-normalized snapshot of the existing demo curriculum; educational text is unchanged.

Frozen split:

- Train: 60 rows / 30 curriculum units
- Validation: 6 rows / 3 curriculum units
- Test: 6 rows / 3 curriculum units

Arabic and English versions of the same curriculum unit stay in the same split.

### Correct-answer position balance

Only answer-option order was changed from `v04_actual`; question text, answer value, distractors, explanation, level, language, subject, and split membership were preserved.

- Train: A=15, B=15, C=15, D=15
- Validation: A=2, B=1, C=2, D=1
- Test: A=1, B=2, C=1, D=2
- Overall: A=18, B=18, C=18, D=18

This fixes the earlier held-out TEST positional issue where only A/B were represented as correct letters.

`data/v04_actual/` is retained only as a historical snapshot for the successful micro/sanity experiments.

## Active output grammar

The model target is `targets.sentinel_native_v2`:

```text
<extra_id_0> question
<extra_id_1> option A
<extra_id_2> option B
<extra_id_3> option C
<extra_id_4> option D
<extra_id_5> correct letter
<extra_id_6> explanation
<extra_id_7>
```

`v04_formats.parse_sentinel()` requires exactly those eight sentinel markers once, in order, with no extra sentinel structure or content outside the grammar.

## Runtime storage

Keep large model artifacts on the large drive, not inside Git or the project SSD. New runs should use the correctly spelled `RAFEEQ_*` variables.

Recommended PowerShell session:

```powershell
$env:RAFEEQ_ML_HOME = "D:\RafeeqML"
$env:HF_HOME = "D:\RafeeqML\hf_cache"
$env:HF_HUB_CACHE = "D:\RafeeqML\hf_cache\hub"
$env:TORCH_HOME = "D:\RafeeqML\torch_cache"
$env:TEMP = "D:\RafeeqML\temp"
$env:TMP = "D:\RafeeqML\temp"
```

`runtime_paths.py` still recognizes the older misspelled `RAFREEQ_*` variables for backward compatibility with earlier experiment notes.

## Run the v0.4 held-out experiment

Active experiment config:

`config_v04.yaml`

The historical `config.yaml` is retained only for v0.2-era scripts/reproducibility.

From `ML_Q_generator/`:

```powershell
.\.venv\Scripts\python.exe -c "import torch; print(torch.__version__); print(torch.cuda.is_available()); print(torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'NO CUDA')"
.\.venv\Scripts\python.exe -m pytest tests -q
.\.venv\Scripts\python.exe scripts\run_v04_generalization.py
```

The generalization runner:

1. audits the 72-row frozen dataset;
2. trains three fresh mT5 runs with seeds 42, 43, and 44;
3. evaluates all six validation conditions every epoch;
4. selects checkpoints and the winning seed using validation generation metrics only;
5. loads the six frozen TEST conditions only after the winner is selected;
6. evaluates TEST once without fallback or target-based repair;
7. saves the selected final model under the configured runtime model directory.

Use `--force` only when intentionally replacing previous **v0.4 generalization** artifacts:

```powershell
.\.venv\Scripts\python.exe scripts\run_v04_generalization.py --force
```

## Runtime outputs

With `RAFEEQ_ML_HOME=D:\RafeeqML`, expected outputs include:

```text
D:\RafeeqML\outputs\v04_full_seed42.json
D:\RafeeqML\outputs\v04_full_seed43.json
D:\RafeeqML\outputs\v04_full_seed44.json
D:\RafeeqML\outputs\v04_validation_comparison.json
D:\RafeeqML\outputs\v04_final_test_results.json
D:\RafeeqML\outputs\v04_final_experiment_summary.json

D:\RafeeqML\models\rafeeq-mt5-qg-v0.4-final\
```

## Evaluation meaning

The held-out runner reports separately:

- strict sentinel parse success;
- correct-answer consistency;
- expected answer present among generated options;
- duplicate/malformed output failures;
- Arabic/English language check;
- exact canonical field match as a diagnostic;
- lexical grounding heuristic as a transparent lexical-overlap heuristic only.

Do not call schema validity or lexical grounding "educational accuracy".

## Historical experiments

The repository retains v0.1-v0.3 and early v0.4 scripts/data for reproducibility. They are not the active training path. In particular:

- the old 360-row v0.2 data included identical inputs with multiple conflicting targets;
- custom structural tokens in v0.3 did not overcome mT5's sentinel prior;
- v0.4 aligned output serialization with the model's native sentinel vocabulary and passed micro/sanity gates.

## Safety

- Data status: **DEMO / PROTOTYPE EDUCATIONAL DATA**.
- No OpenAI calls are required by this ML module.
- No Spring Boot endpoint is created.
- No PostgreSQL or Railway connection is used.
- No frontend, authentication, APK, placement, or production Learning Tree code is imported or modified.
- Even a strong held-out result does not make this model production-ready. Educational content must be reviewed by qualified specialists before any future integration.

## Tests

```powershell
.\.venv\Scripts\python.exe -m pytest tests -q
```

The test suite covers historical utilities plus v0.4 format parsing, frozen split integrity, positional balance, runtime paths, and evaluation helpers.
