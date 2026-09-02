> **HISTORICAL SNAPSHOT:** preserved for v0.4 micro/sanity reproducibility. The current held-out generalization dataset is `../v04_final/`.

# Rafeeq v0.4 research-guided actual data

Derived from the uploaded `ML_Q_generator/data/curriculum_demo.json`. No external educational facts were added.

## Files
- `rafeeq_v04_master_actual.jsonl`: 72 unique unit+language conditions.
- `rafeeq_v04_micro_actual.jsonl`: 2 training-only conditions for the first micro-overfit comparison.
- `rafeeq_v04_sanity_actual.jsonl`: 12 balanced training-only conditions for the next gate.
- `rafeeq_v04_split_manifest.json`: frozen historical split membership recovered from the archive.

## Important design choices
1. One input condition has exactly one desired target.
2. Correct option positions are deterministically balanced across the 72 conditions: A/B/C/D = 18 each. This avoids the current canonical builder's all-A positional bias without reintroducing conflicting targets.
3. `sentinel_native_v2` uses `<extra_id_0>`..`<extra_id_6>` as field delimiters **plus `<extra_id_7>` as the final terminating sentinel**, matching the shape of T5 span-corruption targets more closely.
4. `plain_text` is the control format and uses only ordinary vocabulary.
5. The previous custom-tag format is retained only as a reference.

## Split correction
The previous v0.3 sanity file included `math-l3-compare-total`. In the archived v0.2 split files that unit belongs to TEST. The corrected sanity set uses `math-l3-subtract` instead; all 12 sanity rows are from archived TRAIN units.

## Reproducibility issue found
Current `split_by_unit` creates `list(unit_ids)` from a Python set before `rng.shuffle`. A seed does not guarantee the same result when the incoming set iteration order changes across processes. Sort first, or use the frozen manifest in this bundle.
