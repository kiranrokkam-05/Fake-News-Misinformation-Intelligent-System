# Fake News & Misinformation Intelligent System

## 1. Project overview

This Flask research prototype brings together article-style REAL/FAKE classification, NLP preprocessing and claim extraction, evidence search, heuristic evidence verification, and an explainable final assessment. It is **not a single classifier** and it is not an authoritative fact-checker. Its classifier learns text patterns from a small labeled corpus; its evidence path searches configured sources for one focal claim and applies rule-based/lexical checks. Read the source passages and dates before relying on a result.

## 2. Current project status

| Area | Status |
| --- | --- |
| Flask application and browser demo | Implemented; startup verified |
| Word/character TF-IDF + LinearSVC article classifier | Implemented; saved model and metrics present |
| NLP preprocessing and claim/entity extraction | Implemented, with model/resource fallbacks |
| Evidence retrieval and heuristic verification | Implemented; providers can be skipped or fail independently |
| Combined `/api/check` final assessment | Implemented |
| Automated tests | 43 passing in the latest full run; 9 artifact-version warnings |
| External evaluation schema/evaluator/leakage audit | Implemented |
| Verified external evaluation articles | Not yet supplied (0 records) |
| Source-held-out/time-held-out generalization evaluation | Pending source/date metadata and an external set |

The code is runnable for a Review 2 demonstration. The unfinished research task is credible external generalization evaluation, not achieving a target score by tuning against the current split.

## 3. System architecture

```text
Article or claim
      ↓
Browser frontend → Flask API
      ↓
NLP preprocessing, sentence handling, claim/entity extraction
      ├── article classifier (applicable to longer input)
      └── focal claim selection
                 ↓
        provider query generation and evidence retrieval
                 ↓
        source scoring and lexical stance/verdict rules
                 ↓
        final decision layer combines the two signals
```

The classifier estimates whether longer input resembles the REAL/FAKE training examples. The verifier separately retrieves passages for a factual claim. `backend/final_decision.py` combines those outputs while preserving uncertainty. A classifier label is not proof that a statement is true, and an inconclusive search is not evidence that a claim is false.

## 4. Repository structure

| Path | Role |
| --- | --- |
| `backend/app.py` | Flask app, legacy routes, model loading, startup report, combined `/api/check` |
| `backend/final_decision.py` | Transparent combination rules for classifier and evidence signals |
| `backend/api_v1/` | Separate versioned evidence/NLI API; not the browser's `/api/check` pipeline |
| `frontend/` | Vanilla HTML, CSS, and JavaScript user interface |
| `nlp/` | Preprocessing, claim/entity extraction, and orchestration |
| `ml/` | Active article classifier, confidence semantics, and training code |
| `verification_module/` | Search adapters, retrieval, source scoring, lexical comparison, and evidence verdicts |
| `data/` | Article training CSV and separate claim-level corpora |
| `models/` | Production article model, metrics, and separate v2 artifacts |
| `evaluation/` | External benchmark schema, exclusions log, and evaluation instructions/results |
| `scripts/` | Training/evaluation/audit and demonstration utilities |
| `tests/`, `verification_module/tests/` | Unit and integration tests |
| `start_flask_server.bat` | Windows launcher for the Flask app |
| `BALANCE_FIXES.md` | Team continuation and handover notes |
| `PROJECT_REFERENCE_GUIDE.docx` | Longer project reference; check it against source before relying on details |

Important files: `backend/app.py`, `backend/final_decision.py`, `ml/classifier.py`, `ml/train.py`, `models/fake_news_model.joblib`, `models/model_metrics.json`, `data/fake_and_real_news_dataset.csv`, `evaluation/external_evaluation.csv`, `evaluation/excluded_articles.csv`, `evaluation/README.md`, `scripts/evaluate_external.py`, and `scripts/audit_external_evaluation.py`.

## 5. Technology stack

- Python, Flask, and a vanilla HTML/CSS/JavaScript frontend.
- pandas and NumPy for data handling; scikit-learn for TF-IDF and LinearSVC; SciPy sparse matrices and joblib model serialization.
- NLTK, spaCy (with fallback entity extraction), and VADER sentiment support in the NLP code.
- Requests/HTTP retrieval through Wikipedia, NewsAPI, GNews, Google Custom Search, and Google Fact Check Tools adapters. Wikipedia is enabled without a key; other providers require optional environment variables.
- PyTorch is used by the separate FEVER-based v2/claim API experiment. That is distinct from the active article classifier used by the browser.

## 6. Machine-learning classifier and current metrics

The active Flask article model is a word-and-character TF-IDF `LinearSVC`, saved at `models/fake_news_model.joblib`. The word vectorizer uses up to 60,000 features and unigrams/bigrams; the character vectorizer uses up to 80,000 `char_wb` features and 3–5 character n-grams. The saved training configuration uses `LinearSVC(C=10.0)`.

`ml.train` reads `data/fake_and_real_news_dataset.csv`, combines title and body, normalizes the REAL/FAKE labels, removes duplicate/short content, and uses a stratified 80/20 split with `random_state=42`. The cleaned corpus has 4,572 articles: 2,278 REAL and 2,294 FAKE. The recorded split has 3,657 training and 915 test articles.

| Random held-out measure | Result |
| --- | ---: |
| Accuracy | 96.28% |
| Macro F1 | 96.28% |
| ROC AUC | 99.32% |
| Training accuracy | 100.00% |

| Class | Precision | Recall | F1 |
| --- | ---: | ---: | ---: |
| REAL | 97.31% | 95.18% | 96.23% |
| FAKE | 95.31% | 97.39% | 96.34% |

Confusion matrix (rows = actual class; columns = predicted class; order REAL, FAKE):

|  | Predicted REAL | Predicted FAKE |
| --- | ---: | ---: |
| Actual REAL | 434 | 22 |
| Actual FAKE | 12 | 447 |

These results describe the current **random held-out test split**. They are not real-world accuracy or proof of performance on unseen publishers, topics, or later dates. The 100% training accuracy plus near-duplicate train/test overlap are reasons for caution. Do not combine this score with a future external score.

The saved metrics JSON reports binary precision/recall/F1 for the FAKE class; the per-class REAL values above are from the reproduced classification report for the same split. The startup metrics table currently shows training accuracy as `N/A` because the reporter looks for it inside each model metric row, while the JSON stores it at the top level. The saved file remains the source of the recorded 100% value.

## 7. Decision margin and uncertainty

The current classifier returns decisive `FAKE` for `decision_margin >= 1`, decisive `REAL` for `decision_margin <= -1`, and `SUSPICIOUS / UNCERTAIN` inside the open interval `(-1, 1)`. This is an abstention rule on the raw LinearSVC margin, not a probability threshold.

On the random 915-row holdout, 448 samples abstained (48.96%) and 467 were decisive (51.04% coverage). The decisive subset scored 100% on that split, but this applies only to the covered subset. **It is not overall 100% accuracy.**

## 8. Probability and confidence semantics

LinearSVC does not produce calibrated probabilities here. Legacy `fake_probability` and `real_probability` response keys contain uncalibrated sigmoid display scores and remain only for API compatibility; use `fake_score`, `real_score`, `score_kind`, `probability_calibrated`, and `decision_margin` to understand their semantics. The frontend labels the classifier score uncalibrated. Do not call these values factual probabilities or calibrated confidence. The evidence verifier's confidence is a separate heuristic measure.

## 9. Evidence verification pipeline

The main `verification_module/verify_pipeline.py` path generates concise entity/quantity-preserving queries, requests at most two queries per configured provider, normalizes and deduplicates evidence, applies source-credibility rules, and compares the claim to passages using lexical overlap and confirmation/negation cues. It is **heuristic retrieval and stance logic, not a production-grade natural-language-inference fact checker**. Provider states are exposed. A failed or unconfigured provider is not negative evidence.

The provider adapters are Wikipedia (no key), NewsAPI (`NEWSAPI_KEY`), GNews (`GNEWS_KEY`), Google Custom Search (`GOOGLE_CSE_KEY` plus `GOOGLE_CSE_CX`), and Google Fact Check Tools (`GOOGLE_FACTCHECK_KEY`). Copy `verification_module/.env.example` to the ignored `verification_module/.env` and fill only keys you personally configure. Never commit or paste secret values. Network availability, quotas, provider coverage, query wording, and indexing affect results.

`backend/api_v1/` is a separate, versioned evidence service using a DeBERTa MNLI/FEVER/ANLI model and explicit `calibration: uncalibrated` metadata. It has a distinct model-readiness path and is not the classifier/evidence route used by the current browser's `/api/check`. Do not conflate those pipelines or their labels/metrics.

## 10. Evidence scope and limitations

For long input, `/api/check` selects one representative extracted sentence (highest verifiability score, with tie-breakers) and verifies that focal claim. It does not establish every sentence or every fact in the article. Short input (up to 25 words and 2 sentences in the NLP pipeline) bypasses the article classifier and goes through evidence verification. Search results can be stale, irrelevant, incomplete, or contextually mismatched; topic existence does not establish the exact current claim.

## 11. Final decision rules

The rules in `backend/final_decision.py` return `REAL`, `FAKE`, `SUSPICIOUS / UNCERTAIN`, or `UNVERIFIED`:

| Situation | Final assessment |
| --- | --- |
| Evidence verdict is VERIFIED and does not conflict with a strong FAKE classifier margin | REAL (evidence supports the focal claim) |
| Evidence verdict is FALSE / CONTRADICTED or REFUTES and does not conflict with a strong REAL classifier margin | FAKE (evidence contradicts the focal claim) |
| Supporting evidence conflicts with a decisive FAKE signal, or refuting evidence conflicts with a decisive REAL signal | SUSPICIOUS / UNCERTAIN |
| Evidence is partially true/mixed | SUSPICIOUS / UNCERTAIN |
| No usable evidence, no provider completed successfully, or classifier is uncertain | UNVERIFIED |
| No evidence, at least one provider status is `ok`, and an applicable classifier has a decisive margin | Classifier-only REAL/FAKE, explicitly not externally verified |
| Retrieved evidence exists but does not establish a stance | UNVERIFIED |

Provider errors are never treated as evidence against a claim. Final status is a transparent combination of signals, not an independent proof of factual truth.

## 12. API endpoints

The Flask app exposes these routes from `backend/app.py`:

| Route | Input | Purpose/output |
| --- | --- | --- |
| `GET /api/health` | None | Readiness summary: status, service, modelReady, bestModel, trainingRows |
| `GET /api/model-metrics` | None | Contents of `models/model_metrics.json` |
| `POST /api/analyze` | JSON `{ "text": "..." }` | NLP summary, classification fields, claim/entity data, and score metadata; rejects text under 5 characters |
| `POST /api/check` | JSON `text` or `claim` | Analysis, verification, `verification_focus`, `verification_scope`, `final_decision`, and optional `verification_error` |
| `GET /api/verify` | None | Usage description for the POST route |
| `POST /api/verify` | JSON `claim` or `text` | Evidence-only verification result, queries, provider statuses, evidence and verdict |

There is also a registered versioned blueprint under `/api/v1`: `GET /health/live`, `GET /health/ready`, `GET /version`, `GET /models`, `POST /verify`, `POST /verify/batch`, and `POST /verify/article` (all prefixed `/api/v1`). POST routes require JSON. `/verify` accepts `{ "claim": "...", "options": {"max_evidence": 5, "include_baseline": false} }`; batch accepts 1–10 verify requests; article accepts `{ "text": "..." }` and processes up to 20 period-delimited sentences. This is a separate evidence/NLI API, not the frontend's `/api/check` route.

## 13. Run the project on Windows

Open PowerShell in the repository root. On a fresh clone, create the environment and install requirements:

```powershell
py -m venv .venv
.venv\Scripts\python.exe -m pip install --upgrade pip
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Start the local Flask server:

```powershell
.\start_flask_server.bat
```

Or use the Python fallback:

```powershell
.venv\Scripts\python.exe -m backend.app
```

Open <http://127.0.0.1:5000>. Stop with Ctrl+C. The batch file uses the repository `.venv` when present, checks for the saved artifact, prints the startup report, and runs Flask; it does not train. The built-in Flask server is for local demonstration, not production deployment.

Useful endpoint checks from another PowerShell window:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/api/health
Invoke-RestMethod http://127.0.0.1:5000/api/model-metrics
```

## 14. Review 2 demonstration flow

1. Start Flask and open the browser page.
2. Submit a longer article or claim and show the classifier verdict, margin, and extracted claims.
3. Open **View searched sources** to show queries, provider statuses, and returned passages.
4. Show how the final assessment differs from the separate classifier and evidence outcomes.
5. Demonstrate a short factual claim (classifier bypass), an uncertain longer input, and examples with supporting/refuting evidence when providers return it.
6. If showing REAL/FAKE examples, explain that they are demonstration inputs, not the external benchmark and not proof of overall performance.
7. Mention the limited evidence scope, abstention coverage, and lack of external benchmark.

Do not promise that a live search will return a particular result; provider availability and indexing vary.

## 15. Current testing status

The latest full test run reported **43 passed, 9 warnings**. The warnings are scikit-learn version mismatch notices while loading separate saved v2 artifacts created with 1.7.2 under 1.9.1. Flask startup and test-client checks for `/api/health`, `/api/model-metrics`, `/api/analyze`, `/api/verify`, and `/api/check` were run; the frontend JavaScript syntax check and `git diff --check` also passed during the handover/evaluation work. The server's first-run NLTK check reported WordNet missing in the restricted environment, while startup still succeeded.

Run the suite from the project root:

```powershell
.venv\Scripts\python.exe -m pytest -q
```

Live evidence providers require network access; deterministic automated tests use controlled/mock responses.

## 16. Dataset and evaluation

The training file `data/fake_and_real_news_dataset.csv` is distinct from `evaluation/external_evaluation.csv`. The former trains the article classifier. The latter is reserved only for evaluation **after the production model and protocol are fixed**. Never pass external evaluation data to training, fitting, hyperparameter/threshold tuning, feature selection, or model selection.

The external schema and rules are in [evaluation/README.md](evaluation/README.md). It currently has zero valid article records; no external metrics exist. Required fields: `id`, `title`, `text`, `label`, `source`, `publication_date`, `source_url`, `verification_date`, `verification_notes`; optional `topic`. Excluded candidates belong in `evaluation/excluded_articles.csv` with a reason.

After 100 or more traceable, verified articles are supplied, run:

```powershell
.venv\Scripts\python.exe scripts\audit_external_evaluation.py
.venv\Scripts\python.exe scripts\evaluate_external.py
```

Inspect and adjudicate overlap flags before evaluation. The external evaluator enforces the 100-valid-article minimum, loads the saved model without retraining, and writes under `evaluation/results/` rather than `models/model_metrics.json`. Keep the future external score separate from the 96.28% random-split Macro F1; do not average them or call either real-world accuracy.

`data/README.md` describes the article training data. `data/fever/` and the v2/PyTorch files are separate claim-classification/evidence experiments and their metrics are not comparable with this article classifier.

## 17. Dataset leakage and generalization limits

The previous practical train/test text-similarity audit found 34/915 (3.72%) test articles with maximum word unigram/bigram TF-IDF cosine similarity ≥0.90; 21 (2.30%) ≥0.95; 12 (1.31%) ≥0.98; and 8 (0.87%) ≥0.99. These are heuristic similarity flags, not proof of duplicates. The active training dataset has no reliable publisher or publication-date fields; its opaque `idd` is not provenance. Source-held-out and time-held-out evaluation could not be performed. The random split may therefore overstate generalization.

## 18. Known limitations and risks

### Technical

- The LinearSVC scores are not calibrated probabilities. The ±1 margin rule abstains on many samples and limits coverage.
- The main evidence path is heuristic and can miss paraphrase, context, temporal changes, or nuanced reasoning.
- Provider access, quotas, network availability, retrieval quality, and source-credibility rules affect results.
- The separate `/api/v1` NLI service has its own model readiness and uncalibrated scores; it should not be mistaken for `/api/check`.
- Startup currently displays `Train Acc: N/A` due the metric JSON shape, even though the saved JSON has training accuracy at the top level.

### Dataset and evaluation

- The training corpus is small and lacks publisher/date provenance; random splits cannot measure source/time generalization.
- Near-duplicate similarity overlap was observed in the random split; inspect flags rather than treating them as confirmed duplicates.
- The external benchmark has no valid records, so there is no external performance estimate.

### Evidence and demo

- `/api/check` covers one representative claim in long input, not all article claims.
- Provider errors and no indexed results can leave true claims UNVERIFIED.
- A local demo can show the pipeline, but live provider results are not deterministic.

## 19. What is safe to change / what needs caution

Normal areas for independent work include documentation, evaluation reporting, UI improvements, test coverage, claim extraction, evidence ranking, and additional provider adapters.

Treat these as controlled changes: `ml/train.py`, the training labels/dataset, `models/fake_news_model.joblib`, `models/model_metrics.json`, the ±1 threshold, final-decision rules, evidence interpretation, and API response contracts. Before changes, define an evaluation plan, preserve artifact provenance, run tests, and verify frontend/API compatibility. Do not change them just to improve a displayed metric.

## 20. Things not to do

- Do not call 96.28% real-world accuracy or report decisive-subset 100% as overall accuracy.
- Do not fabricate articles, sources, URLs, dates, labels, or evidence for the external benchmark.
- Do not use external benchmark articles for training or tuning.
- Do not randomly change thresholds, retrain to inflate the score, or overwrite the production artifact without a documented plan.
- Do not call compatibility sigmoid scores calibrated probabilities.
- Do not claim every fact in an article has been verified.
- Do not remove leakage flags without review or remove failing tests to hide regressions.
- Do not change API response shapes without checking callers, including the frontend.
- Never commit API keys or local `.env` files.

## 21. Review 2 talking points

- The project combines an article-style text classifier with a separate evidence retrieval/verification path.
- The active article model is word/character TF-IDF plus LinearSVC, with an uncertainty band based on its signed margin.
- The random held-out split produced 96.28% Macro F1; this is not an estimate of real-world generalization.
- Evidence is searched for one focal claim and assessed with heuristic retrieval/stance rules; provider failure is not treated as refutation.
- `/api/check` returns classifier and evidence signals plus an explainable final assessment.
- The next research step is a traceable 100–200 article external benchmark, with duplicates reviewed and no use in training.

## 22. Recommended next work and handover

1. Re-run the test suite and local API demo in the receiving environment.
2. Collect a balanced initial external set (for example, 50 REAL and 50 FAKE) with verified provenance and diverse Indian/international sources, topics, and dates. Do not invent records.
3. Run `scripts/audit_external_evaluation.py`; manually adjudicate text/title similarity flags and record exclusions.
4. Freeze the benchmark and evaluation protocol before scoring.
5. Run `scripts/evaluate_external.py`; report the separate external metrics, abstention/coverage, source/topic/date distributions, exclusions, and overlap findings.
6. Compare—not average—the external Macro F1 with the random-split 96.28% reference. Investigate domain shift and label quality before considering model changes.
7. Only after a defensible benchmark, consider source/time-held-out training-data evaluation, improved claim extraction/evidence ranking, stronger NLI, calibration, or a more diverse training dataset.

See [BALANCE_FIXES.md](BALANCE_FIXES.md) for the continuation checklist, known warnings, commands, and file-level change cautions. The project is runnable for Review 2; external generalization evaluation remains unfinished until verified articles are supplied.
