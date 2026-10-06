# External evaluation data

This directory is reserved for a trustworthy external benchmark of the **already fixed production article classifier**. It is deliberately separate from `data/fake_and_real_news_dataset.csv`. The initial target is approximately **100–200 valid articles**, from multiple publishers, topics, and publication dates. The CSV currently contains only its schema header; **there is no external benchmark yet**. Do not infer or invent articles, labels, publishers, dates, URLs, or verification notes.

## CSV schema

`external_evaluation.csv` currently contains only its header row. Add one independently sourced article per row using these columns:

| Field | Required? | Meaning |
| --- | --- | --- |
| `id` | Yes | Stable unique identifier within this evaluation set |
| `title` | Yes | Article headline; preserve source wording |
| `text` | Yes | Article body text used for evaluation |
| `label` | Yes | `REAL` or `FAKE`, assigned with documented evidence and the same task definition as the model labels |
| `source` | Yes | Publisher or originating organization |
| `publication_date` | Yes | Original publication date in ISO 8601 format (`YYYY-MM-DD`) |
| `source_url` | Yes | URL of the original article or a stable archive |
| `verification_date` | Yes | Date the label and article identity were checked (`YYYY-MM-DD`) |
| `verification_notes` | Yes | Concise rationale and links/citations supporting the label; note corrections or updates |
| `topic` | Optional | One manually assigned broad topic category for distribution reporting (for example politics, economy/finance, technology, health, science, sports, social issues, or major events) |

Use `REAL`/`FAKE` consistently with the project's article-level task. A REAL label needs a legitimate source confirming that the reported event/claim occurred. A FAKE label needs a reliable fact-check or equivalent evidence that the article/claim is false or misleading. Cite that basis in `verification_notes`; retain corrections and context. Do not label an article FAKE solely because one unrelated detail is disputed. Track licensing/terms and preserve the original publication date. Include Indian and international reporting and a range of topics. Prefer publishers and periods not represented in training.

If provenance or label quality is inadequate, do not add the article to the benchmark. Record it in the header-only `excluded_articles.csv` with the evidence URL (when available), review date, and specific exclusion reason. This preserves an exclusion count and rationale without contaminating the evaluated set. The evaluator requires every non-topic field above, valid `YYYY-MM-DD` publication and verification dates, and an HTTP(S) source URL; incomplete/invalid rows are reported as excluded. IDs must be unique. Before acceptance, review every candidate for provenance, label support, exact/normalized duplicates, high text similarity, and title overlap. The audit utility reports possible matches; it never deletes or rewrites rows. Exclude or manually adjudicate suspicious overlap before freezing the evaluation set.

## Leakage-control procedure

Run the audit before calculating metrics:

```powershell
.venv\Scripts\python.exe scripts\audit_external_evaluation.py
```

It compares article text and titles with the training corpus and checks duplicates within the external set. Defaults flag article cosine similarity at or above `0.95` and title cosine similarity at or above `0.85`; use `--threshold` and `--title-threshold` only for sensitivity review, and record the chosen thresholds. TF-IDF similarity is a lexical heuristic; it does not prove duplication. Manually inspect flagged pairs, document adjudication, and do not change records automatically. Evaluation data must remain unseen by production training.

## Evaluate the existing saved model

From the repository root in PowerShell:

```powershell
.venv\Scripts\python.exe scripts\evaluate_external.py
```

Optional paths:

```powershell
.venv\Scripts\python.exe scripts\evaluate_external.py --dataset evaluation\external_evaluation.csv --model models\fake_news_model.joblib --output evaluation\results\external_evaluation_metrics.json
```

Only run the benchmark evaluation after **at least 100 valid, provenance-checked articles** are present and leakage findings have been adjudicated. The script enforces the 100-record minimum before emitting a report. This framework does not fetch or validate articles automatically; verified records must be supplied first.

This loads the existing `FakeNewsClassifier` artifact and does not train or save a model. It reports overall raw classifier predictions, accuracy, REAL/FAKE precision/recall/F1, Macro F1, confusion matrix, abstention/coverage under the current ±1 LinearSVC margin rule, decisive-subset metrics, source/topic/publication-year distributions, skipped rows, and the excluded-article log summary. Overall prediction metrics include all valid labeled examples; decisive-subset metrics include only samples with absolute margin at least 1. Results are written under `evaluation/results/`, separate from `models/model_metrics.json`.

Evaluation data must **never** be passed to `ml.train`, model fitting, hyperparameter or threshold tuning, feature selection, or model selection. The production model and evaluation protocol must be fixed before the set is scored. Do not repeatedly tune against the external set.

After a valid set is available, run the leakage audit, external evaluation, complete existing test suite, and a production model/dataset/metrics integrity check. Report excluded records and reasons, suspected overlaps, and source/topic/date distributions. Compare the external Macro F1 with the existing random-split reference of 96.28% as two separate measurements; do not average them or describe the external score as training performance.

Interpret a close result as reasonably consistent only within the benchmark's size and composition limits. A lower score can indicate domain shift, source/topic composition differences, label issues, or leakage/protocol problems; inspect these before considering any model change. Even 100–200 records cannot establish broad real-world accuracy.

## Audit overlap and duplicates

```powershell
.venv\Scripts\python.exe scripts\audit_external_evaluation.py
```

The utility compares exact and normalized article text and titles against training data and within the evaluation set. It also reports each evaluation row's closest word unigram/bigram TF-IDF cosine match for article text and title. Defaults flag article similarity at `0.95` and title similarity at `0.85`; use `--threshold` and `--title-threshold` for sensitivity review. TF-IDF similarity is a lexical heuristic: a high score indicates text worth reviewing, but does not prove that two articles are duplicates. No records are removed or changed. The report is written to `evaluation/results/leakage_audit.json`.

Do not interpret results from a manipulated or repeatedly tuned evaluation set as an independent final estimate. Keep a frozen copy and document any exclusions outside the scripts.

## Calibration audit

The active LinearSVC exposes its signed decision margin. It does not expose calibrated probabilities. The legacy `fake_probability` and `real_probability` fields are sigmoid display scores and are marked with `probability_calibrated: false`; consumers should use `decision_margin` and its abstention rule, not treat those fields as factual probabilities. The UI labels the displayed classifier score as uncalibrated. The evidence-verification confidence is a separate heuristic signal, not calibrated classifier confidence.

Probability calibration could be useful for downstream decisions that need interpretable likelihoods or threshold selection, especially if paired with reliable held-out calibration data. It should be considered only after collecting an independent, representative evaluation/calibration set. Calibration changes probabilities, not the evidence available to the verifier, and must not be claimed as improved fact accuracy by itself.

## Future multi-claim verification design (not implemented)

The current `/api/check` verifies one highest-verifiability extracted sentence for longer input. A future multi-claim design should keep each extracted claim's evidence and verdict independently inspectable:

```text
Article
  -> claim extraction and deduplication
  -> rank claims
  -> for each selected claim: retrieval -> evidence quality -> stance
  -> claim-level aggregation with coverage and conflicts
  -> article-level assessment
```

Suggested initial scope: verify up to **five distinct claims** per article (at least the top three when available), with a configurable lower cap for short articles to control latency and provider use. Rank by factual specificity and verifiability: named entities, quantities/dates, explicit assertions, and centrality to the article; penalize opinion, vague predictions, duplicate claims, and fragments. Preserve article sentence indices so results can be traced back to text.

Score evidence per claim using separate factors: semantic relevance to the claim, passage support/refutation strength, source reliability, source independence, publication/retrieval time relevance, and whether the passage addresses the same entity, quantity, and time period. Deduplicate syndicated copies so they do not count as independent corroboration. Keep these as transparent components; calibrate any combined score on labeled development data before calling it a probability.

Keep `SUPPORTED`, `REFUTED`, `MIXED/CONTESTED`, and `UNVERIFIED` at claim level. A strongly supported and a strongly refuted material claim should yield a mixed/uncertain article assessment, not cancel through simple majority voting. One well-supported refutation of a central claim may justify an article-level adverse assessment; peripheral errors should not outweigh several central supported claims automatically. Require sufficient evidence coverage and independent sources before a high-confidence article status. Return the list of claims, evidence, provider statuses, coverage, and aggregation rationale.

Provider errors, rate limits, or empty indexes must count as missing evidence, never as refutation. Retry/fallback policy and provider status should be visible. If too few material claims have usable evidence, return UNVERIFIED; if central claims have material conflicting evidence, return SUSPICIOUS/UNCERTAIN; reserve an overall supported/refuted outcome for sufficient, high-quality evidence across the selected central claims. This design is documentation only; no multi-claim behavior is implemented here.
