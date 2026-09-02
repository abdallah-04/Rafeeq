# Rafeeq v0.4 final generalization dataset

This folder is the frozen dataset snapshot for the first held-out generalization experiment. It is **demo/prototype educational data**, not Ministry-approved or clinically validated curriculum.

## Files
- `rafeeq_v04_final_master.jsonl`: 72 unique unit+language conditions.
- `rafeeq_v04_final_split_manifest.json`: frozen unit membership and split-level answer-position targets.
- `curriculum_v04_final.json`: metadata-normalized snapshot of the existing demo curriculum; educational text is unchanged.

## Frozen split
- Train: 60 rows / 30 units
- Validation: 6 rows / 3 units
- Test: 6 rows / 3 units

Arabic and English rows for the same unit stay in the same split. Test membership is locked and must not be consulted for model/checkpoint/seed selection.

## Correct-answer position balancing
The previous `v04_actual` master was balanced globally but its TEST rows contained only correct letters A/B. This snapshot changes **option order only** while preserving the exact question, answer, distractors, explanation, unit, language, level, and split membership.

Target distribution:
- Train: A=15, B=15, C=15, D=15
- Validation: A=2, B=1, C=2, D=1
- Test: A=1, B=2, C=1, D=2
- Overall: A=18, B=18, C=18, D=18

This avoids positional bias while keeping the held-out curriculum units unchanged.

## Model format
The active target is `targets.sentinel_native_v2`:

`<extra_id_0>` question → `<extra_id_1..4>` options A-D → `<extra_id_5>` correct letter → `<extra_id_6>` explanation → `<extra_id_7>` terminator.

The model input is the frozen `input_condition`; metadata and expected answer fields are never fed to the model.
