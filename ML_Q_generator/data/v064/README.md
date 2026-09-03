# Rafeeq ML Question Generator v0.6.4

This is an offline structured-plan-to-question experiment. The model receives a non-linguistic slot-based semantic plan and generates only question wording with native mT5 question sentinels. It does not receive the complete target question, the trusted answer, distractors, or explanation.

v0.6.3 was an incomplete semantic-planner pilot. Its three sanity seeds reached 24/24, but its full run stopped before checkpoint selection and hidden evaluation. The v0.6.3 audit found complete canonical-question copy leakage, trusted-answer input leakage, weak level conditioning, an incorrect validation-loss label, early hidden-file construction, and row-by-row runtime inefficiency. v0.6.4 addresses these issues without changing historical data.

Explanations, answers, distractors, option order, and correct letters remain deterministic curriculum outputs. This is a hybrid curriculum-grounded generator, not pure end-to-end AI generation.
