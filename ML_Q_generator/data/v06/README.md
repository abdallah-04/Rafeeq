# v0.6 Dataset

This snapshot is derived from the frozen v0.5 high-quality conditions and does not modify v0.5 files. It contains 480 unique conditions, 240 bilingual curriculum units, 48 concept families, and 128 template families.

The project does not fabricate additional examples to reach a numeric target. The 480-condition snapshot was retained because it passes the audit for uniqueness, balance, native sentinel serialization, structured math verification, and split isolation.

The v0.6 split is family-disjoint: suffix family `06` is validation, suffix family `07` is the official hidden test, and suffix family `08` (the v0.5 test family) is not used in the v0.6 hidden test. See `split_manifest_v06.json` for exact membership.

Math rows carry `fact_payload` records verified by `rafeeq_qg.hybrid.verify_math_fact`. These facts are curriculum metadata, not generated model targets.
