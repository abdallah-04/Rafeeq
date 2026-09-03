# Rafeeq v0.6.4b

Corrected gold-target and validator diagnostic experiment. The v0.6.4b neural input is a structured semantic plan without the natural-language target question, final-answer labels, `correct_value`, or experiment `unit_id`. Recognition values are explicitly represented as task stimuli; reading passages are allowed to contain retrieved answers as curriculum stimuli.

The corrected gold sanity set is required to pass semantic and level-style validation before any model training.

## Experiment history

- v0.6.4 failed sanity because of gold-target and evaluator inconsistencies.
- v0.6.4a diagnosed gold semantic `21/24` and level-style `18/24`.
- v0.6.4b fixed the independent target, validator, and leakage defects.
- The three-seed train-only sanity gate passed for seeds 42, 43, and 44.

## Full generalization result

The full runner trained `google/mt5-small` with Adafactor on 480 train rows, selected checkpoints using validation-only generation rank, and selected seed 42 epoch 9. The fixed batch probe selected physical batch size 4, with gradient accumulation 1 and generation batch size 4.

Hidden first-pass and after-retry core ML acceptance were both `30/60`; strict level-aware acceptance was `25/60`. The retry policy used beam sizes 1, 2, and 4, with 30 rows reaching attempt 2 and 30 reaching attempt 3. The deterministic fallback was used for 30 rows, giving system validated delivery `60/60`; this is not model accuracy. Deterministic options, answer placement, and explanations passed `60/60` integrity checks.

The final model is saved outside the repository at `RAFEEQ_ML_HOME/models/rafeeq-mt5-qg-v0.6.4b-final`. Runtime reports are under `RAFEEQ_ML_HOME/outputs`.

The first post-training finalization attempt encountered a report-serialization bug after hidden loading. Recovery completed from the saved winner, but necessarily read the hidden file again. Therefore the successful continuation's instrumentation reports `hidden_test_open_count` `0 -> 1`, while the overall attempted workflow did not satisfy the literal physical-open-once requirement. No production integration or deployment was performed.
