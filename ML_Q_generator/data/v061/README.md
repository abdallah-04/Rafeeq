# v0.6.1 Corrective Experiment

v0.6.1 is a new corrective experiment. The 480 frozen v0.5 conditions are transformed into the training pool with a short native-sentinel target containing only a model-generated question and explanation. Thirty new bilingual units provide validation and thirty new bilingual units provide the hidden test, for 600 conditions total.

The model does not generate answers, distractors, option positions, or correct letters. The deterministic curriculum layer supplies those fields from trusted prototype metadata, verifies supported math facts, removes duplicate distractors, and assigns a stable SHA-256-based correct position.

The required fresh 24-condition sanity gate reached 18/24 strict short parses and 18/24 language passes after 30 epochs, below the required 22/24 threshold. Therefore the full three-seed experiment was correctly not run. The runtime report is `D:\RafeeqML\outputs\v061_sanity.json` when `RAFEEQ_ML_HOME` is configured.

This is a hybrid curriculum-grounded ML question generator, not pure end-to-end neural MCQ generation.
