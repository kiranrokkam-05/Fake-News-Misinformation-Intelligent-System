# Implementation Log

## Phase 0 — Audit and freeze

Date: 2026-09-29

### Changed

- Preserved the supplied implementation specification verbatim in `docs/TRANSFORMATION_SPEC.md`.
- Created branch `evidence-pipeline`.
- Tagged the pre-phase commit as `baseline-v2`.
- Added `docs/AUDIT.md` with repository, data, model, API, frontend, verification-module, environment, and deployment findings.
- Added `models/registry.json` with SHA-256 hashes and purposes for all existing model artifacts.

### Commands run

```text
git switch -c evidence-pipeline
git tag baseline-v2
python --version
python -c "import torch; ..."
pytest -q
```

### Real results

- Python: 3.13.7
- PyTorch: 2.10.0+cpu
- CUDA: unavailable; CPU-only execution confirmed
- Tests: `18 passed, 2 warnings`
- FEVER v2 test accuracy from existing metrics: `0.6249877989263055`
- Active model: `pytorch_claim_binary_v2_model.pt`
- Active Flask route: `/api/analyze`

### Failures or limitations recorded

- No lock file exists for exact dependency reproduction.
- Verification module is not connected to Flask/frontend.
- Wikipedia retrieval currently fails with HTTP 403 because no User-Agent is sent.
- Optional providers are unconfigured.
- No Docker/WSGI/deployment setup is present.
- Existing working-tree changes predated this phase and were not reverted.

## Phase 1 — Foundations

Date: 2026-09-29

### Changed

- Replaced untyped verification configuration constants with `pydantic-settings` settings and compatibility aliases.
- Added automatic `.env` loading and a placeholder User-Agent warning.
- Added `verification_module/retrieval/http_client.py` with host allowlisting, timeout, redirect restriction, User-Agent, and response-size limits.
- Routed all existing provider adapters through the shared HTTP client.
- Added `ProviderStatus` and `RetrievalResult` structures.
- Changed retrieval orchestration to report skipped and failed providers rather than silently swallowing orchestrator exceptions.
- Added structured logging helpers that keep claim text out of INFO metadata.
- Added foundation tests.

### Commands run

```text
pytest -q
python -c "from verification_module.evidence_retrieval import retrieve_evidence_with_status; ..."
```

### Real results

- Tests: `21 passed, 2 warnings`
- Live Wikipedia smoke test: `ok`, 5 results for both astronomical claims
- Optional providers: explicitly reported as `skipped` because credentials are absent
- Wikipedia results included relevant pages such as `Orbit of the Moon`, `Earth's orbit`, `Earth's rotation`, and `Sun`

### Limitations

- Adapters still return search snippets rather than full passages; passage retrieval is Phase 3.
- The legacy lexical comparison and decision engine remain in place and are not yet allowed to make evidence-backed verdicts.
- Provider status is currently available through the retrieval result but is not yet exposed through Flask.

## Phase 2 — Domain model

Date: 2026-09-29

### Changed

- Extended `verification_module/models.py` with explicit `SUPPORTS`, `REFUTES`, and `INSUFFICIENT` verdict values while preserving legacy verdict names.
- Added `Passage`, `NLIScores`, `Aggregation`, and `ProviderStatus` structures.
- Extended `EvidenceItem` with provenance, passage, relevance, weight, and NLI metadata.
- Extended `VerificationResult.to_dict()` with provider status, evidence strength, flags, aggregation, model metadata, limitations, and timing fields.
- Added domain serialization tests without removing or weakening legacy tests.

### Real results

- Tests: `23 passed, 2 warnings`
- Legacy verification tests remained passing.

### Limitations

- The new fields are not yet populated by retrieval or NLI.
- Legacy comparison and decision behavior remains active only in the standalone legacy pipeline until later phases replace it.

## Phase 3 — Retrieval and passages

Date: 2026-09-29

### Changed

- Added deterministic claim normalization, quantity/entity extraction, and query variants.
- Added sentence-window passage extraction.
- Added CPU-safe lexical/hybrid ranking interfaces with optional dense-ranker boundary.
- Updated Wikipedia retrieval to fetch page extracts and revision IDs after search.
- Added oldid permalinks, retrieval timestamps, source type, licensing note, and passage text to Wikipedia evidence.
- Added retrieval component tests.

### Commands run

```text
pytest -q
python -m ... retrieve_evidence_with_status(...)
```

### Real results

- Tests: `26 passed, 2 warnings`
- Wikipedia live retrieval returned real passages for both requested claims.
- Moon query returned `Orbit of the Moon` with revision `1372790933`.
- Sun/Earth query returned `Earth's rotation` with revision `1373717750` and `Sun` with revision `1376829934`.
- Every returned Wikipedia item in the smoke test had a URL, oldid permalink, revision ID, retrieval timestamp, and passage text.

### Limitations

- Search results are not yet reranked across providers or deduplicated by semantic similarity.
- Dense retrieval and cross-encoder reranking are interfaces with a deterministic lexical fallback; model installation/loading is a later phase.
- Provider status is emitted once per query rather than aggregated per provider.
- Wikipedia retrieval now has real passages, but no NLI verdict is made from them yet.

## Phase 4 — Evidence reasoning

Date: 2026-09-29

### Changed

- Added an explicit NLI model loader using `MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli`.
- Added `ModelUnavailable`; no lexical fallback is used by the NLI boundary.
- Added generic numeric conflict assessment as an advisory flag.
- Added source-capped noisy-OR support/refute aggregation.
- Added explicit `SUPPORTS`, `REFUTES`, and `INSUFFICIENT` decision logic with contested/margin handling.
- Added reasoning unit tests.
- Declared `transformers` in the main dependency manifest.

### Commands run

```text
pytest -q
python -c "from verification_module.reasoning.nli import load_nli_model; ..."
python -c "retrieve real passages; score them with NLI"
```

### Real results

- Tests: `30 passed, 2 warnings`
- NLI model loaded successfully on CPU.
- Model labels: `entailment`, `neutral`, `contradiction`.
- Moon claim versus `Orbit of the Moon`: entailment `0.9971`.
- Sun/Earth claim versus `Analemma`: contradiction `0.5669`; other retrieved passages were neutral.

### Limitations

- NLI is not yet orchestrated into `verify_pipeline.py`.
- The NLI model is downloaded into the local Hugging Face cache, not committed to the repository.
- The model is uncalibrated; scores are not factual probabilities.
- The downloaded model's license and exact revision still need to be recorded in the model card/registry phase.

## Phase 5 — Evaluation status at pause

Date: 2026-09-29

### User-directed execution change

The initial full SciFact development evaluation was stopped after running
for approximately 26 minutes without producing a final report. It must not
be run again in full.

The subsequent bounded run was also stopped at the user's direction before
completion. No full-benchmark result was reported or fabricated.

### Preserved outputs

- The existing report-only custom validation output was written to
  `reports/custom_validation.json`.
- No `reports/scifact_dev.json`, `reports/scifact_dev_progress.jsonl`,
  `reports/scifact_test.json`, or `reports/scifact_test_progress.jsonl`
  existed from the stopped SciFact runs at the time of this pause.
- SciFact source files remain in `data/eval/scifact/`.

### Completed custom validation

The custom validation script ran all eight report-only claims through live
Wikipedia retrieval and the NLI model. It recorded actual predictions,
scores, provider statuses, evidence passages, revision IDs, and per-claim
timings in `reports/custom_validation.json`.

The claims were not used for training or threshold tuning.

### Prepared but not yet run

`scripts/run_eval.py` now:

- uses fixed random seed `42`;
- samples exactly 60 SciFact dev claims and 60 SciFact test claims;
- labels the output `Small-sample, not a full benchmark`;
- writes one JSONL checkpoint row per claim and flushes immediately;
- logs per-claim progress;
- writes average and p95 seconds per claim;
- reports dev metrics only for the labeled dev subset;
- reports no accuracy for the downloaded unlabeled test split;
- does not tune thresholds.

The optimized batched evaluator was prepared after the stopped run, but
the 60-dev/60-test execution remains pending until the user explicitly
requests continuation.

### Phase 5 gate status

- Full evaluation stopped as requested: PASS
- No fabricated full-benchmark metrics: PASS
- Custom validation report written: PASS
- Fixed-seed subset evaluator implemented: PASS
- 60 dev subset executed: PENDING
- 60 test subset executed: PENDING
- Average/p95 subset latency report: PENDING
- Phase 6 API v1: NOT STARTED

## Launcher correction before continuation

Date: 2026-09-29

The original `start_ml_system.bat` ran `python setup_ml.py` on every launch,
which retrained the v2 classifier and was incompatible with the instruction to
stop training. It now installs/verifies dependencies, checks that all existing
v2 artifacts are present, and starts `python -m backend.app` without training.
Missing artifacts cause a visible error and instruct the operator to run
training manually only after an explicit retraining decision.

## Phase 6 — Evidence API v1

Date: 2026-09-29

### Changed

- Added the versioned `/api/v1` Flask blueprint with single-claim, batch,
  article, liveness, readiness, version, and model metadata endpoints.
- Added strict Pydantic request validation and JSON-only request handling.
- Added structured validation and model-unavailable error responses.
- Added the evidence retrieval + NLI orchestration service, including source
  credibility scoring before evidence aggregation.
- Added a WSGI entry point and API contract tests.
- Kept `/api/analyze` available as a deprecated, non-evidence baseline route.

### Validation

```text
pytest -q
33 passed, 2 warnings
```

The real Flask server was restarted with the Phase 6 code and tested over
HTTP:

- `GET /api/v1/health/live` returned `200`.
- `POST /api/v1/verify` for “The Moon orbits the Earth.” returned `200`,
  verdict `SUPPORTS`, with two evidence items.

### Limitations

- Evidence NLI scores are uncalibrated and are not probabilities of factual
  truth.
- The frontend still uses the legacy route until the planned frontend phase.
- SciFact bounded evaluation results remain pending while the fixed-seed
  evaluator runs; no full benchmark is being executed.
