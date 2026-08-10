# Verification & Integration Module

Owns your role's slice of the **Unified Multimodal NLP-Based Fake
News Detection and Claim Verification System**: evidence retrieval,
source credibility scoring, claim↔evidence comparison, cross-source
aggregation, and final verdict/explanation generation.

This is a **working skeleton**: every stage runs end-to-end right
now with stub/heuristic logic, so you can demo the full pipeline
before any real API keys or NLP models are wired in. Swap the
`TODO`-marked pieces for the real thing as the project matures.

## How it fits the team

```
Frontend Dev        -> UI, sends raw text/image/PDF, displays result
Backend Dev         -> API layer, calls verify_pipeline.verify_claim()
NLP & ML Dev         -> claim extraction, embeddings, real NLI model
                        (feeds this module a clean claim string, and
                        can later replace comparison.py's heuristic)
YOU (Verification &  -> everything in this folder
Integration Dev)
```

## Structure

```
verification_module/
├── config.py              # env-var API keys, thresholds
├── models.py               # EvidenceItem, VerificationResult, Verdict, Stance
├── adapters/                # one file per free search/evidence provider
│   ├── base.py              # abstract SearchAdapter interface
│   ├── wikipedia_adapter.py # no key needed, always available
│   ├── newsapi_adapter.py
│   ├── gnews_adapter.py
│   ├── google_cse_adapter.py
│   └── factcheck_adapter.py
├── evidence_retrieval.py   # runs all configured adapters, dedupes
├── credibility.py          # 0-100 domain-based credibility scoring
├── comparison.py           # claim vs evidence stance (supports/contradicts/neutral)
├── decision_engine.py      # the 6-verdict decision logic
├── explainability.py       # formats VerificationResult as a report
├── verify_pipeline.py       # top-level verify_claim(claim) entrypoint
├── tests/test_pipeline.py  # offline unit tests (no API keys needed)
├── requirements.txt
└── .env.example
```

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env   # then fill in whichever free keys you have
```

Every adapter is optional — the pipeline works with **zero keys**
configured (Wikipedia has no key requirement and is always on).
Get free keys here as you add them:

| Provider | Free tier | Get a key |
|---|---|---|
| NewsAPI.org | 100 req/day | https://newsapi.org/register |
| GNews.io | 100 req/day | https://gnews.io/register |
| Google Custom Search | 100 queries/day | https://programmablesearchengine.google.com/ |
| Google Fact Check Tools | free | Enable in Google Cloud Console |
| Wikipedia | unlimited, no key | n/a |

## Usage

```python
from verification_module.verify_pipeline import verify_claim
from verification_module.explainability import format_report

result = verify_claim("ISRO successfully landed Chandrayaan-3 on the Moon in 2023.")
print(format_report(result))
print(result.to_dict())  # JSON-serializable, for the Backend Dev's API
```

## Testing

```bash
pytest verification_module/tests/test_pipeline.py -v
```

Tests use hand-built evidence (no network calls), so they run
without any API keys and are safe for CI.

## What's stubbed vs. real right now

| Piece | Status | Real version comes from |
|---|---|---|
| Query generation | stub (uses raw claim) | NLP & ML Dev's keyphrase/NER pipeline |
| Search adapters | **real API calls** | already wired up, just needs your keys |
| Credibility scoring | rule-based domain list | fine for demo; extend list or use a reputation API later |
| Claim↔evidence stance | lexical-overlap heuristic | NLP & ML Dev's Sentence-BERT / NLI model — only `comparison.py` needs to change |
| Decision engine | **real logic**, all 6 verdicts | tune thresholds in `config.py` as real confidence scores come in |

## Adding a new evidence provider

1. Create `adapters/your_provider_adapter.py`, subclass `SearchAdapter`.
2. Implement `is_configured()` and `search()`, returning `list[EvidenceItem]`.
3. Add it to `ALL_ADAPTERS` in `adapters/__init__.py`.

Nothing else in the pipeline needs to change — that's the point of
the adapter pattern the project spec calls for.
