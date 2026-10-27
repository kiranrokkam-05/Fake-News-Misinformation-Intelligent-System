# Fake News and Misinformation Intelligent System

A local Flask research prototype for checking factual claims against retrieved evidence. The browser experience uses a versioned retrieval and natural language inference (NLI) pipeline. A separate legacy article classifier is also included, but the current browser does not call it.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow and [SECURITY.md](SECURITY.md) for private vulnerability reporting and secret handling.

This tool supports investigation; it does not prove truth or replace human fact-checking. Review the passages, source links in the API response, dates, and context. An `INSUFFICIENT` result means the system did not establish support or contradiction from the evidence it processed; it does not mean the claim is false.

## Current browser experience

The Flask server serves the frontend from `frontend/`. The page accepts pasted text or a public article URL and displays an evidence verdict, evidence strength, NLI-assessed passages, provider statuses, aggregated support/refute signals, and extracted entities.

The browser sends text to `POST /api/v1/verify` as one claim. Its text area allows up to 20,000 characters, but the single-claim endpoint accepts at most 1,000 characters. Longer text may therefore be rejected by the API. The separate `/api/v1/verify/article` endpoint processes sentence-sized requests, but the current page does not use it.

The API returns source URLs, but the current result renderer does not display clickable evidence links. The interface currently advises users to review linked sources; inspect the API response directly when you need those URLs.

The browser does not call the legacy article classifier or the combined legacy `/api/check` route. Keep the two output types separate when interpreting results or metrics.

## Architecture

```text
Browser (frontend/)
  ├── POST /api/v1/verify       pasted text, treated as one claim
  └── POST /api/v1/verify/url   public article URL
          ↓
Flask API (backend/app.py, backend/api_v1/)
          ↓
Claim normalization and query generation
          ↓
Configured local and web evidence providers
          ↓
Source scoring and DeBERTa NLI passage assessment
          ↓
Source-capped support/refute aggregation
          ↓
SUPPORTS, REFUTES, or INSUFFICIENT
```

The active API v1 evidence model is `MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli`. It compares retrieved passages with the submitted claim, then combines passage stance and source weights. Exact matches from project claim datasets retain their supplied dataset stance. Model scores and evidence-strength values are uncalibrated and are not probabilities of truth.

The repository also includes a distinct word/character TF-IDF plus LinearSVC article classifier. The legacy `/api/analyze` route runs it, and `/api/check` combines its output with a separate heuristic evidence route. Neither route is called by the current browser.

## Evidence decisions and scope

The evidence service:

1. Builds deterministic queries from claim text, entities, and quantities.
2. Runs configured adapters and records whether each provider succeeded, was skipped, or failed.
3. Deduplicates retrieved results by URL and filters timestamped items to the requested recency window. Undated reference sources can remain.
4. Assesses passages with NLI, scores source credibility, and aggregates at most one item per source domain.
5. Uses the decision rules in `verification_module/reasoning/decision.py` to return `SUPPORTS`, `REFUTES`, or `INSUFFICIENT`.

The current UI requests up to 10 evidence items and a four-hour recency window. The API supports 1–20 evidence items and windows from 1 to 168 hours. Decision thresholds are currently fixed in code and are not calibrated or established for production use. A provider error, skipped provider, or empty search is missing information, not refutation.

URL verification accepts HTTP or HTTPS, rejects localhost and private-address targets, disables redirects, uses an eight-second request timeout, and limits fetched response content to 2 MB. The backend extracts readable HTML text and verifies only its first 1,000 characters; it does not check every claim in the article.

## API

All POST endpoints require JSON. The versioned endpoints are registered under `/api/v1`.

| Method and route | Purpose and limits |
| --- | --- |
| `POST /api/v1/verify` | Verify one claim (5–1,000 characters). Options: `max_evidence` (1–20), `recent_window_hours` (1–168), and `include_baseline`. |
| `POST /api/v1/verify/batch` | Verify 1–10 claims using the single-claim request schema. |
| `POST /api/v1/verify/article` | Accept up to 20,000 characters; splits on periods and checks at most 20 sentences of at least five characters. This route is not used by the browser UI. |
| `POST /api/v1/verify/url` | Fetch and verify a public HTTP(S) article URL; see URL limits above. |
| `GET /api/v1/health/live` | Process liveness. |
| `GET /api/v1/health/ready` | Attempts to load the NLI model and reports readiness. First use may take time or require a model download. |
| `GET /api/v1/version` | API and pipeline version. |
| `GET /api/v1/models` | Evidence model and optional baseline metadata. |
| `GET /api/v1/providers` | Lists known providers and whether each is configured. |

Example request:

```json
{
  "claim": "The Moon orbits the Earth.",
  "options": {
    "max_evidence": 10,
    "recent_window_hours": 4
  }
}
```

The response includes the verdict, evidence strength and band, calibration status, recency details, flags, evidence passages and source metadata, aggregation scores, queries, provider statuses, explanation steps, model metadata, limitations, and request timing. Validation errors return HTTP 400; an unavailable NLI model returns HTTP 503. The API's successful JSON payload is the most complete source for provider URLs and returned evidence.

### Separate legacy Flask routes

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Legacy article-model health summary. |
| `GET /api/model-metrics` | Saved article-classifier metrics. |
| `POST /api/analyze` | NLP and article-style REAL/FAKE classification; requires `models/fake_news_model.joblib`. |
| `POST /api/verify` | Evidence-only legacy heuristic verification. |
| `POST /api/check` | Combines the legacy classifier and legacy evidence path. For long input, verifies one representative extracted claim rather than every sentence. |

These routes are retained for compatibility and comparison. Their outputs and metrics are separate from the current browser's API v1 NLI results.

To deliberately retrain the legacy article classifier, run `.venv\Scripts\python.exe -m ml.train`. This overwrites `models/fake_news_model.joblib` and `models/model_metrics.json`; it is not required to run the browser evidence-verification flow.

## Evidence providers and configuration

The adapter registry includes local project-claim records, SciFact, Wikipedia, NewsAPI, GNews, Google Custom Search, and Google Fact Check Tools. Optional provider credentials are read from environment variables or ignored local dotenv files.

| Variable | Provider |
| --- | --- |
| `NEWSAPI_KEY` | NewsAPI |
| `GNEWS_KEY` | GNews |
| `GOOGLE_CSE_KEY` and `GOOGLE_CSE_CX` | Google Custom Search |
| `GOOGLE_FACTCHECK_KEY` | Google Fact Check Tools |
| `WIKIPEDIA_USER_AGENT` | Optional Wikipedia request identification; a default is provided. |

Copy `verification_module/.env.example` to `verification_module/.env` to configure local keys, or set environment variables. The root `.env` is also supported. Never commit credentials. Provider quotas, network access, freshness, search coverage, and source quality affect the results. Claim text may be sent to enabled external providers during verification.

## Setup and run on Windows

From PowerShell in the repository root:

```powershell
py -m venv .venv
.venv\Scripts\python.exe -m pip install --upgrade pip
.venv\Scripts\python.exe -m pip install -r requirements.txt
.\start_flask_server.bat
```

Open <http://127.0.0.1:5000> and stop the server with Ctrl+C. The launcher starts Waitress through `backend.wsgi:app`; it does not train a model. The current evidence API needs the NLI model to be available in the local Hugging Face cache or downloadable when the model is first loaded. Network access may also be needed by web evidence providers.

To run the Flask app directly instead of using the launcher:

```powershell
.venv\Scripts\python.exe -m backend.app
```

The repository includes a Dockerfile, but no `docker-compose.yml`. A public deployment needs separate configuration for TLS, network egress, secrets, shared rate limiting, monitoring, and data-retention policy.

## Data, models, and evaluation

| Path | Role |
| --- | --- |
| `data/fake_and_real_news_dataset.csv` | Article-level REAL/FAKE training data for the legacy LinearSVC classifier. |
| `data/fever/` | FEVER-derived claim records for separate claim-model and dataset matching components. |
| `data/eval/scifact/` | SciFact material used by the evidence/research components when present locally. |
| `models/fake_news_model.joblib` and `models/model_metrics.json` | Legacy article-classifier artifact and random-split metrics. |
| `models/pytorch_claim_binary_v2_*` | Separate FEVER-derived classifier artifacts; not the browser's NLI model. |
| `reports/custom_validation.json` | Small report-only validation run; not a general benchmark. |
| `evaluation/` | External article-evaluation schema, protocol, and exclusion log. |

The saved article classifier reports approximately 96.28% accuracy and 96.28% macro F1 on its 915-row random held-out split, with 100% training accuracy. These numbers describe that experiment only. They are not current browser metrics or an estimate of broad real-world accuracy. The external article evaluation CSV currently has no valid records, so there is no external generalization result. Do not use external evaluation records for training or model tuning.

The complete SciFact benchmark was not completed; the custom report contains only a small validation set. Do not present it as benchmark performance. See [evaluation/README.md](evaluation/README.md) for the separate article evaluation protocol and [docs/LIMITATIONS.md](docs/LIMITATIONS.md) for current caveats.

## Tests

Run the project test suite from the repository root:

```powershell
.venv\Scripts\python.exe -m pytest -q
```

Automated tests use controlled or mocked evidence responses. They do not guarantee live provider availability or a particular search result. Re-run the suite on the current checkout before reporting a current pass count; older implementation notes record earlier incremental runs.

## Repository map

| Path | Purpose |
| --- | --- |
| `backend/app.py`, `backend/wsgi.py` | Flask application, legacy routes, request protections, Waitress entry point. |
| `backend/api_v1/` | Versioned JSON API, request schemas, and NLI evidence service. |
| `frontend/` | Browser interface served by Flask. |
| `verification_module/` | Evidence providers, retrieval, claim parsing, source scoring, and NLI reasoning. |
| `nlp/`, `ml/` | Legacy article text preprocessing, claim extraction, classifier, and training code. |
| `data/`, `models/` | Training/evidence datasets and saved model artifacts. |
| `tests/`, `verification_module/tests/` | Unit and API tests. |
| `evaluation/`, `reports/` | Evaluation protocol, audit outputs, and report-only results. |
| `PROJECT_REFERENCE_GUIDE.docx` | Detailed project reference guide. |

## Security and known limitations

- Flask limits request bodies to 128 KiB and applies an in-memory rate limit of 60 requests per client address per minute. The limiter is per process and is not a shared multi-worker control.
- The app sets basic security response headers and the Windows launcher binds to localhost. The Docker command binds inside the container to `0.0.0.0`.
- URL-fetch protections reduce common risks but do not replace hardened outbound network controls.
- NLI scores, evidence strength, and source credibility are not calibrated probabilities. Current decision thresholds are not production-tuned.
- Retrieval can be incomplete, stale, irrelevant, or contextually mismatched. Undated sources may remain in recent-news results.
- The article classifier and the NLI verifier use different tasks, data, and metrics. Neither independently establishes factual truth.
- The browser currently accepts longer pasted text than the single-claim API schema allows, and it does not render the source URLs returned by the API.
- No cloud deployment is documented. Require human review for consequential decisions.
