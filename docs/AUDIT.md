# Phase 0 Audit and Freeze

Audit date: 2026-09-29  
Branch: `evidence-pipeline`  
Baseline tag: `baseline-v2`  
Baseline commit: `425ee217361af6f5a3ecb2f4b14bfbdd2886470e`

## Repository and environment

- Repository root: `C:\Users\laksh\Documents\NLP\Fake-News-Misinformation-Intelligent-System`
- Operating system: Windows 11
- CPU reported by Python: Intel64 Family 6 Model 140 Stepping 2
- Python: 3.13.7
- PyTorch: 2.10.0+cpu
- CUDA available: `False`
- PyTorch CPU threads: 4
- Git is available; the working tree was already dirty before this phase. Existing changes were not reverted.

The complete non-generated repository tree was enumerated during the audit. Important areas are:

```text
backend/
data/
models/
src/
tests/
verification_module/
Project/
index.html
app.js
requirements.txt
setup_ml.py
setup_ml_v2.py
```

`Project/` contains a second frontend copy. The served application uses the root `index.html`, which loads the root `app.js` at `index.html:538`. The `Project/` copy is not served by `backend/app.py`.

## Dependencies

The main dependency manifest is [requirements.txt](../requirements.txt). It declares Flask, pandas, NumPy, scikit-learn, joblib, XGBoost, NLTK, spaCy, SciPy, VADER, PyTorch, and pytest. The verification module has a separate [requirements.txt](../verification_module/requirements.txt) containing requests and pytest.

Observed installed versions include:

- Flask 3.x
- pandas 2.x
- NumPy 2.x
- scikit-learn 1.x
- joblib 1.x
- NLTK 3.x
- spaCy 3.x
- SciPy 1.x
- PyTorch 2.10.0+cpu
- pytest 8.x
- requests 2.x

Exact package versions are environment state rather than a lock file. No `pyproject.toml`, `setup.py`, package lock, Dockerfile, WSGI module, or compose file was present at audit time.

## Datasets

### FEVER-derived v2 data

- `data/fever/train.jsonl`
- `data/fever/dev.jsonl`
- Source documentation: [data/fever/README.md](../data/fever/README.md)
- Mapping: `SUPPORTS -> TRUE`, `REFUTES -> FALSE`
- `NOT ENOUGH INFO` is excluded from the binary model
- Usable unique claims: 108,045
- TRUE: 75,737
- FALSE: 32,308
- Duplicate claims excluded: 7,365
- Train: 83,130
- Validation: 14,670
- Test: 10,245

Recorded v2 test metrics:

- Accuracy: 0.62499
- Macro precision: 0.63015
- Macro recall: 0.62546
- Macro F1: 0.62176
- Confusion matrix, class order `FALSE`, `TRUE`: `[[2728, 2420], [1422, 3675]]`

### Legacy binary article data

- `data/fake_and_real_news_dataset.csv`
- Shape: 4,594 rows x 4 columns
- Columns: `idd`, `title`, `text`, `label`
- Labels: `REAL=2,297`, `FAKE=2,297`
- The legacy v1 model reports 4,572 training rows and 915 test rows after its preprocessing/splitting.
- This is article-level fake/real data, not claim-level evidence data.

### Legacy six-class data

- `data_sample/fake.csv`
- Shape: 23,481 rows x 4 columns
- Columns: `title`, `text`, `subject`, `date`
- There is no dedicated truth-label column; the earlier six-class topic model used subject categories.
- A naive audit of the final column shows dates, not truth labels.

## Model artifacts

[models/registry.json](../models/registry.json) records SHA-256 hashes, sizes, baseline commit, and purpose for every `.pt`, `.joblib`, and metrics `.json` artifact.

Active inference artifacts:

- `models/pytorch_claim_binary_v2_model.pt`
- `models/pytorch_claim_binary_v2_tfidf.joblib`
- `models/pytorch_claim_binary_v2_label_encoder.joblib`
- `models/pytorch_claim_binary_v2_metrics.json`

The active Flask import is `backend.nlp_pipeline_v2`. The legacy v1 binary and six-class artifacts remain available but are not used by the active route.

## Flask/API audit

[backend/app.py](../backend/app.py) creates a Flask app with the repository root as its static directory. No CORS configuration, request size limit, API-key protection, rate limiting, structured request IDs, security headers, or JSON logging is configured.

Routes:

- `GET /api/health`
- `GET /api/model-metrics`
- `POST /api/analyze`
- `GET /`
- `GET /<path:path>` static fallback

`POST /api/analyze` accepts JSON shaped as:

```json
{"text": "claim text"}
```

The active response contains the v2 binary prediction, confidence, class probabilities, model metadata, processed text, and TF-IDF feature count. It does not contain evidence, source URLs, provider status, quotations, stance, or an abstention result.

## Frontend audit

The served root [index.html](../index.html) loads [app.js](../app.js). The frontend calls `/api/health` and `/api/analyze`.

The result path stores backend fields in `state.verdictData`, then renders the prediction and confidence. The file uses `innerHTML` for some UI templates, including history/result markup. Evidence text is not currently returned by the API, so there is no evidence rendering path to assess.

The UI contains copy describing source searching and multi-step verification, but the active API path only runs the v2 TF-IDF/PyTorch classifier. This wording is not evidence of actual retrieval.

## Verification module audit status

[verification_module/](../verification_module/) is standalone and is not imported by Flask or the frontend.

It contains:

- Provider adapters for Wikipedia, NewsAPI, GNews, Google CSE, and Google Fact Check
- Raw-claim-only query generation
- Search-result title/snippet normalization
- Domain-based credibility scoring
- Lexical-overlap and cue-word stance heuristics
- Weighted decision logic
- Explanation formatting
- Offline tests using synthetic hand-built evidence

It currently does not fetch full documents or passages, rank evidence, perform NLI, or expose evidence through Flask.

The live standalone pipeline returned `UNVERIFIED` with zero evidence for both requested astronomical claims. Wikipedia returned HTTP 403 because the adapter does not send a compliant User-Agent. Other providers were skipped because credentials were not configured. Provider exceptions are swallowed by the retrieval loop.

## Deployment and operational status

Not verified/present:

- Dockerfile
- docker-compose file
- WSGI entry point
- production server configuration
- API versioning
- health/readiness separation
- request limits
- CORS policy
- structured logging
- rate limiting
- model download/bootstrap script
- deployment environment

No deployment occurred.

## Tests

Command:

```text
pytest -q
```

Observed result:

```text
18 passed, 2 warnings
```

The warnings were third-party deprecation warnings from Typer/Click. The baseline tests were not deleted or weakened.

## Secrets and repository state

The tracked secret-like file scan found [verification_module/.env.example](../verification_module/.env.example), which contains placeholders. `.env` is ignored. No committed live API key was found by the filename-based audit. This is not a complete secret scanner.

The working tree contained pre-existing modifications before Phase 0. Only the specification, this audit, the implementation log, and the generated model registry were added during Phase 0.

## Phase 0 gate

- Baseline tag created: PASS
- Branch `evidence-pipeline` created: PASS
- Specification preserved at `docs/TRANSFORMATION_SPEC.md`: PASS
- Model registry generated: PASS
- Existing test suite passes: PASS
- Active model and API path identified: PASS
- Unverified operational items explicitly recorded: PASS

