# Rafeeq Local Question Generator Prototype

This is a standalone, local ML prototype for curriculum-grounded bilingual quiz-question generation. It was created for safe experimentation only. It does not import, call, or modify the Rafeeq backend or Expo application.

## Scope and safety

- **Data status:** `DEMO / PROTOTYPE EDUCATIONAL DATA`.
- The fixture contains fictional, curriculum-like bilingual examples only. It has no learner records, patient data, credentials, real curricula, or production database data.
- There are no OpenAI calls, API calls, database connections, Railway configuration changes, Spring Boot imports, or React/Expo imports.
- The module is intentionally not wired to placement, learning-tree, homework, activity, quiz, authentication, or production API flows.
- `backend_mapper.py` is a pure dictionary mapper that documents the existing quiz field naming convention. It does not import or invoke backend code.

## Model approach

`google/mt5-small` is the configurable baseline in [config.yaml](config.yaml). The training script uses PyTorch and Hugging Face `transformers`/`datasets` to fine-tune a local sequence-to-sequence model on the demo JSONL files. This is not claimed as a trained model unless `scripts/train.py` completes on a machine with the dependencies and model available.

The generation scripts also include a deterministic, curriculum-grounded local fallback. It uses only each unit's supplied prompt, answer, and three distractors, produces exactly four shuffled options, and validates the result. It allows safe schema demonstrations and tests before any local model has been trained.

## Layout

- `data/curriculum_demo.json`: 24 bilingual demo units: Math and Language, four topics per subject at each of levels 1-3.
- `data/difficulty_anchors.json`: explicit level anchor definitions.
- `data/train.jsonl`, `validation.jsonl`, `test.jsonl`: generated 54/9/9 unit-disjoint demo records.
- `src/rafeeq_qg/`: loader, formatter, dataset builder, local model wrapper, trainer, generator, validator, evaluator, and convention-only mapper.
- `scripts/`: dataset preparation, local training, generation, evaluation, and demo commands.
- `tests/`: unit tests for curriculum coverage, level validation, generated schemas, mapper convention, and split leakage.
- `models/` and `outputs/`: local-only generated artifacts; both retain only `.gitkeep` in version control.

## Setup

From this directory:

```powershell
py -m pip install -r requirements.txt
py scripts/prepare_dataset.py
py -m pytest tests -q
```

Python 3.10-3.13 is supported by the declared PyTorch/Transformers stack. The prototype code itself does not download or call a model during normal demo generation.

## Train locally

```powershell
py scripts/train.py
```

This performs local fine-tuning only after the required packages and the configured Hugging Face model files are available. The resulting weights are stored in `models/rafeeq-mt5-qg-v0.1/` and are ignored by Git. If a local model cannot be downloaded or trained, do not present the fallback output as model-generated or trained.

## Generate and evaluate

```powershell
py scripts/demo.py
py scripts/generate.py --level 2 --num-questions 4 --subject MATH
py scripts/evaluate.py --input outputs/generate_level_2.json
```

`demo.py` writes four deterministic baseline questions for each level to `outputs/demo_level_1.json`, `outputs/demo_level_2.json`, and `outputs/demo_level_3.json`, followed by baseline-only schema/grounding metrics in `outputs/baseline_evaluation_metrics.json`. These are not trained-model results.

## Output contract

Every generated question includes `source_unit_id`, `subject`, bilingual topic/question/options/explanation fields, `correct_option` in `1..4`, and `target_level`. `validator.py` rejects empty bilingual fields, invalid levels/options, duplicate option values, duplicate question text within a run, and unknown source units.

`backend_mapper.py` maps a validated question to the existing Rafeeq quiz convention only:

```text
question_ar, question_en,
option_1_ar, option_1, option_2_ar, option_2,
option_3_ar, option_3, option_4_ar, option_4,
correct_option, explanation_ar, explanation_en
```

This is documentation and future integration preparation, not an integration. Any future production adoption requires a separate reviewed design for educational validation, curriculum governance, model evaluation, privacy, API versioning, and controlled rollout.

## Demo samples

The deterministic demo produces source-grounded question records like these (option order may be shuffled):

```json
{
  "source_unit_id": "math-l1-count-one",
  "question_ar": "أي عدد يعني عنصراً واحداً؟",
  "question_en": "Which number means one item?",
  "correct_option": 3,
  "target_level": 1
}
```

Actual demo prompts across the required levels are:

- Level 1: `Which number means one item?` from `math-l1-count-one`.
- Level 2: `What is 1 + 1?` from `math-l2-add-one`.
- Level 3: `What did Omar play with in the park?` from `lang-l3-reading-detail`.

Each full record always includes the required four bilingual options and bilingual explanation fields.

## Limitations and future work

This tiny demo fixture cannot establish learning effectiveness, curriculum validity, bias, or clinical validity. The fallback is deterministic and curriculum-grounded, not a trained model. Future integration must remain a separate, reviewed effort: validate educational quality with subject experts, evaluate a locally trained model against held-out curriculum units, add governance and safety review, define a versioned integration contract, and use a controlled rollout without changing the existing Rafeeq flows until approved.
