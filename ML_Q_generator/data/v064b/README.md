# Rafeeq v0.6.4b

Corrected gold-target and validator diagnostic experiment. The v0.6.4b neural input is a structured semantic plan without the natural-language target question, final-answer labels, `correct_value`, or experiment `unit_id`. Recognition values are explicitly represented as task stimuli; reading passages are allowed to contain retrieved answers as curriculum stimuli.

The corrected gold sanity set is required to pass semantic and level-style validation before any model training. This experiment is train-only during the correction task; validation generation and hidden evaluation remain locked.
