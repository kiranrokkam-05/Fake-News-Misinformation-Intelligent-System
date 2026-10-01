# FEVER-derived claim dataset

Source: `RUC-NLPIR/FlashRAG_datasets`, `fever` directory, retrieved 2026-09-28:
https://huggingface.co/datasets/RUC-NLPIR/FlashRAG_datasets/tree/main/fever

Files:

- `train.jsonl`
- `dev.jsonl`

The records contain short claims in `question` and evidence-derived labels in
`golden_answers`. The downloaded binary subset contains `SUPPORTS` and `REFUTES`
records. `NOT ENOUGH INFO` is not mapped to either class; records with unsupported
or ambiguous labels are excluded by the preparation/loader.

Mapping used by v2:

- `SUPPORTS` -> `TRUE`
- `REFUTES` -> `FALSE`

This dataset is suitable for claim-level binary classification, but the model
does not independently retrieve evidence at inference time.
