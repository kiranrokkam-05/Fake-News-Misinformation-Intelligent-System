# Evaluation data

## SciFact

SciFact is downloaded from the AllenAI repository and is credited here as
the source of the evaluation corpus and claim splits:

<https://github.com/allenai/scifact>

The corpus and claim splits are used for evaluation only. SciFact is
distributed under the Creative Commons Attribution-NonCommercial (CC BY-NC)
license; this project must preserve the
non-commercial limitation when using these files.

The recommended NLI model was trained on FEVER/ANLI. SciFact results are
therefore reported as an external evaluation, not as an uncontaminated
generalization claim.

## Custom validation set

`claims_v1.jsonl` is a report-only set containing the seven requested
validation claims and additional claims. It is never used for training or
threshold tuning. Labels are accompanied by source URLs and
`needs_human_review: true`.
