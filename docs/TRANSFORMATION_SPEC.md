ROLE
You are the implementation engineer for the repository open in this workspace ("Fake-News-Misinformation-Intelligent-System"). Execute the specification below by inspecting and modifying the actual files, installing dependencies, running commands and tests, and reporting real results. Work autonomously; ask me only if you are blocked.

FIRST ACTION
Save this entire specification verbatim to docs/TRANSFORMATION_SPEC.md and re-read it at the start of every phase. Keep docs/IMPLEMENTATION_LOG.md, appending after each phase: what changed, commands run, real outputs, failures. Commit after each phase on a new branch `evidence-pipeline`.

============================================================
1. PROJECT CONTEXT
============================================================
The project began as a B.Tech fake-news classifier. The goal is an evidence-grounded claim verification platform: CPU-only, free/open-source, modular monolith, API-first, explainable, testable, deployment-ready. Do not describe it as deployed or unqualifiedly production-ready.

WHAT ACTUALLY EXISTS (verified by a prior read-only audit)
- Active path: index.html + app.js (repo root) -> POST /api/analyze in backend/app.py -> backend/nlp_pipeline_v2.py (load_bundle(), analyze()) -> TF-IDF + PyTorch binary classifier -> TRUE/FALSE with confidence and class_probabilities.
- The v2 classifier was trained on FEVER-derived claims: SUPPORTS->TRUE, REFUTES->FALSE, NOT ENOUGH INFO excluded. It cannot abstain. (User-reported: ~108,045 claims, TRUE 75,737 / FALSE 32,308, ~62.5% held-out accuracy; earlier v1 article classifier ~91% is article-level and is NOT claim-verification accuracy. Verify these from files/logs; report if you cannot.)
- Live failures: "The Moon orbits the Earth." -> FALSE (80.49%); "The Sun revolves around the Earth once every 24 hours." -> TRUE (68.03%). User also reports wrong outputs for: Earth revolving ~365.25 days -> TRUE (ok) ; Water freezes ~0C -> FALSE; Water freezes at 100C -> TRUE; Pacific largest ocean -> TRUE; Shakespeare wrote Hamlet -> TRUE. These seven are VALIDATION CASES, never rules.
- verification_module/ exists but is STANDALONE and NOT called by Flask or the frontend. Files: verify_pipeline.py (verify_claim), evidence_retrieval.py, models.py (EvidenceItem, stance/verdict/result models), credibility.py, comparison.py, decision_engine.py, explainability.py, config.py, adapters/{base,wikipedia,newsapi,gnews,google_cse,factcheck}_adapter.py, README.md (calls itself a working skeleton), requirements.txt, tests/test_pipeline.py (offline, hand-built evidence).
- Known defects in verification_module:
  a) generate_queries() returns only [claim].
  b) Wikipedia adapter sends no User-Agent -> HTTP 403 "Please set a user-agent"; adapters return only title/snippet/URL/date (no page text, no passages).
  c) evidence_retrieval.py swallows provider exceptions (`except Exception: continue`), so missing key, 403, rate limit, and no-results are indistinguishable.
  d) NewsAPI, GNews, Google CSE, Google Fact Check need keys/credentials that are not configured; config.py reads only os.environ; .env.example exists but no .env loading.
  e) Fact-check ratings are pasted into snippets, not structured.
  f) comparison.py is a lexical placeholder (token overlap + negation/confirmation word lists) whose fallback returns weak SUPPORTS on adequate overlap with no cue. This is unsafe.
  g) No ranking, no dedup, no source independence. decision_engine.py divides weighted totals by item count, so neutral items dilute evidence.
  h) Verdict vocabulary (VERIFIED, FALSE / CONTRADICTED, PARTIALLY TRUE, UNVERIFIED, EXISTING TOPIC / STATUS NOT ESTABLISHED, EMERGING / ONGOING) does not map cleanly to SUPPORTS/REFUTES/INSUFFICIENT.
  Live standalone result for both claims: UNVERIFIED, confidence 0.0, zero evidence.
- Tests seen passing before this work: verification_module/tests/test_pipeline.py and tests/test_claim_v2.py.
- A second frontend file Project/app.js exists; its relationship to root app.js is unknown.

NOT VERIFIED (treat as absent until Phase 0 proves otherwise): repo tree, .gitignore, git state, main-app dependency files, dataset and artifact locations, backend/app.py details (CORS, limits, logging), frontend rendering safety, any Dockerfile/WSGI/health endpoint/logging/API versioning, any deployment.

THE CORE PROBLEM
A claim-only text classifier is being used as a source of truth. The fix is to make retrieved evidence the input to the verdict, with entailment reasoning, abstention, and provenance. Do NOT try to fix this by tuning or relabeling the classifier.

============================================================
2. ABSOLUTE PROHIBITIONS
============================================================
You must NOT:
- hardcode claim answers, keyword truth rules, claim-specific branches or special cases (including for the seven validation claims);
- invert or remap labels or manipulate probabilities to get desired outputs;
- fabricate evidence, sources, URLs, quotations, confidence, metrics, or test results;
- hand-write "evidence" fixtures: fixtures must be captured from real provider responses with provenance recorded (provider, URL, retrieved_at, revision id). Synthetic test doubles are allowed only for pure logic tests, clearly named as synthetic, and never derived from the seven claims;
- hide, skip, or weaken failing tests; delete or alter baselines to improve metrics;
- tune thresholds on the test set or on the custom eval set;
- let the lexical heuristic or the baseline classifier decide a verdict;
- claim deployment occurred, or claim production-readiness without explicit qualification;
- add unnecessary infrastructure (Kubernetes, Kafka, microservices, vector DB services).
You MUST: use real tests, real evidence, real metrics, real provenance; keep CPU compatibility; prefer free/open-source; state limitations plainly; report failures.

============================================================
3. PHASE 0: AUDIT AND FREEZE (do this first)
============================================================
1. Create branch `evidence-pipeline`; tag current commit `baseline-v2` (or note if git is absent).
2. Produce docs/AUDIT.md from actually opening files and running commands: full tree (exclude venv/node_modules/.git), all dependency files and versions, datasets (path, size, label distribution), model artifacts and which one the app loads, all Flask routes with request/response shape, backend/app.py settings (CORS, limits, logging), which of root app.js vs Project/app.js index.html loads and how results are rendered (any innerHTML use), existing tests and their real pass/fail counts (run them), Docker/WSGI/env/health/logging status, and any committed secrets (report only; do not rewrite history). Mark anything unconfirmed "NOT VERIFIED".
3. Reproduce/record baseline metrics for v1 and v2 from existing scripts/logs where possible; write models/registry.json listing every baseline artifact with path, sha256, and purpose. Do not move or delete artifacts.
4. Record the environment: Windows, CPU-only (Intel i5-1155G7), ~24 GB RAM, Python version. Confirm PyTorch CPU works.
Gate: baseline tests pass and are unchanged; AUDIT.md complete.

============================================================
4. TARGET ARCHITECTURE (implement this)
============================================================
Claim -> claim analysis (normalize; preserve numbers/units/dates; extract entities and quantities) -> query generation -> retrieval (Wikipedia; optional local corpus; optional keyed providers) -> passage extraction -> hybrid ranking (BM25 + dense, reciprocal rank fusion) -> dedup -> cross-encoder rerank -> NLI per (passage, claim) -> independence-aware aggregation -> SUPPORTS / REFUTES / INSUFFICIENT + evidence strength + flags -> templated explanation from real evidence -> /api/v1 -> frontend.
The old classifier remains only as a labeled diagnostic baseline, never in the verdict path.

Architecture is a modular monolith: verification_module/ is the core library; backend/ is a thin Flask layer.

IMPLEMENT NOW: everything above, plus batch and article-text verification, caching, provider status reporting, evaluation harness, tests, Docker, WSGI, structured logging, limits.
ARCHITECT FOR FUTURE (interfaces/stubs only, documented): atomic claim decomposition (ClaimDecomposer interface with an identity implementation), temporal reasoning (show evidence dates and set `possibly_outdated` flag only), multi-hop evidence, table evidence, URL ingestion, async job queue, persistent audit DB, LLM-written explanations.
REQUIRES EXTERNAL INFRA (document only): full Wikipedia dump + ANN index, GPU-scale models, paid news/search APIs, cloud hosting/TLS/secrets manager/log shipping.

============================================================
5. PHASE 1: FOUNDATIONS
============================================================
- verification_module/config.py: typed settings (pydantic-settings), automatic .env loading (python-dotenv), all thresholds and provider toggles configurable; WIKIPEDIA_USER_AGENT env var in the form "AppName/version (contact)" with a startup warning if left as placeholder.
- retrieval/http_client.py: single hardened outbound client: host allowlist, timeouts, retry with backoff, response size cap, redirect restrictions, proper User-Agent, polite rate limiting. All providers use it.
- Structured logging (stdlib JSON formatter): request ID, timing, provider status. INFO logs must not contain claim text (log hash + length); claim text only at DEBUG. Never log secrets.
- ProviderStatus model: name, status (ok|skipped|error), reason, latency_ms, n_results. Remove every silent `except Exception: continue` in retrieval; map each failure to a ProviderStatus.
Gate: unit tests for settings, http client (mocked), provider-status mapping.

============================================================
6. PHASE 2: DOMAIN MODEL
============================================================
Extend verification_module/models.py (do not rewrite what works): Verdict enum (SUPPORTS, REFUTES, INSUFFICIENT), Stance (SUPPORTS, REFUTES, NEUTRAL), Passage, NLIScores, EvidenceItem (require provider and URL; reject items lacking them; include permalink/revision_id, retrieved_at, published_at, source_type, licence note, passage text, relevance, weight), Aggregation, VerificationResult (verdict, evidence_strength, strength_band, calibration status, flags, evidence, aggregation, retrieval/provider statuses, explanation, model versions, limitations, timing). Keep legacy names importable or adapt legacy tests transparently, and document each adaptation in the log. Never delete a legacy test to make things pass.

============================================================
7. PHASE 3: RETRIEVAL
============================================================
- Fix adapters/wikipedia_adapter.py: proper User-Agent; retrieve page text (verify current MediaWiki API constraints empirically, e.g. extract limits, and choose the approach that works: search to get top-N titles, then fetch text for those titles); capture revid and build an oldid permalink; retrieved_at; CC BY-SA licence note. Provider-level structured errors.
- Keep NewsAPI, GNews, Google CSE and Fact Check adapters; they are key-gated and default OFF. They return ProviderStatus. Fact-check ratings are stored verbatim as metadata and are never auto-converted into a stance; they are shown as "existing published fact-check" when similarity to the claim passes a configured threshold.
- claims/normalize.py, claims/entities.py: spaCy en_core_web_sm for entities, noun chunks and quantities (preserve numbers, units, dates). Fallback to a regex splitter if spaCy is unavailable.
- retrieval/queries.py: original claim, entity-focused query, entity+relation query, built by deterministic templates over extracted structure, with no per-claim rules.
- retrieval/passages.py: 1-3 sentence windows with the page title prepended; cap passages per claim.
- retrieval/bm25.py (rank_bm25), retrieval/dense.py (BAAI/bge-small-en-v1.5; fallback sentence-transformers/all-MiniLM-L6-v2), retrieval/hybrid.py (RRF), retrieval/dedup.py (canonical URL; near-duplicate by embedding cosine or shingle Jaccard), retrieval/rerank.py (cross-encoder/ms-marco-MiniLM-L-6-v2 on top ~30; configurable off), retrieval/cache.py (TTL cache; key = normalized claim + pipeline/model versions + config hash).
- adapters/local_corpus_adapter.py + scripts/build_local_corpus.py: build a BM25+dense index over the SciFact corpus (~5K abstracts) for evaluation and offline scientific mode. Do NOT download the full Wikipedia or FEVER wiki dump.
- Evidence fetcher may only contact allowlisted provider hosts. It never fetches user-supplied URLs.
Gate: integration tests with recorded real responses; a live Wikipedia smoke test (marked `live`) that shows real passages; report real retrieval output.

============================================================
8. PHASE 4: REASONING
============================================================
- reasoning/nli.py: load MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli (fallback cross-encoder/nli-deberta-v3-small). Pin the revision. Premise = passage, hypothesis = claim. Map labels to entail/neutral/contradict. Batch inference, truncation, torch thread control. Check each model card's licence, and record it in docs/MODEL_CARD.md and models/registry.json. If the model cannot load, the pipeline raises ModelUnavailable (API returns 503). It MUST NOT fall back to the lexical heuristic for verdicts.
- reasoning/numeric.py: generic quantity/unit extraction and comparison. It produces an advisory `numeric_conflict` flag and lowers evidence strength only. It must never flip a label or contain claim-specific content.
- reasoning/aggregate.py and decision_engine.py: per-passage stance = argmax if max prob >= tau_stance else NEUTRAL; weight = normalized relevance x bounded source prior (config-driven 0.5-1.0; affects magnitude only); one best passage per independent source (domain + dedup cluster) with a per-domain cap; S = noisy-OR of weight*p_entail, R = noisy-OR of weight*p_contradict; if max(S,R) < tau_min -> INSUFFICIENT; if S >= tau and R < tau_contested -> SUPPORTS; symmetric for REFUTES; if both are high, the stronger side wins only when the margin >= delta, otherwise INSUFFICIENT; set `contested` in both cases. All thresholds live in config with provenance notes. Fix the old divisor-dilution bug (do not divide by item count).
- credibility.py: config-driven source-type priors (bounded; never determines direction). Document that authority is not truth.
- comparison.py: keep as `LexicalStanceHeuristic`, diagnostic only; change its default-overlap fallback from SUPPORTS to NEUTRAL; it is never used in verdicts.
- reasoning/calibration.py: temperature scaling fit on SciFact dev; if not fit, calibration.status = "uncalibrated". Never present evidence_strength as probability of truth.
- explainability.py: templated explanation built only from real evidence items (quote, stance, scores, source). No generated prose.
- verify_pipeline.py: orchestrate all stages; expose verify_claim(), verify_claims() (batch), verify_article_text() (sentence segmentation + simple structural check-worthiness filter, capped, each sentence verified independently). Flags: contested, numeric_conflict, possibly_outdated (date display only), low_relevance, no_evidence, provider_errors.
Gate: unit tests for aggregation/abstention math (synthetic doubles, clearly labeled), model tests marked `model`.

============================================================
9. PHASE 5: EVALUATION (before the API)
============================================================
- scripts/download SciFact (record licence CC BY-NC: non-commercial; note in data/eval/README). Map SUPPORT->SUPPORTS, CONTRADICT->REFUTES, NEI->INSUFFICIENT. Tune thresholds and calibration on SciFact dev only; report on SciFact test.
- Create data/eval/claims_v1.jsonl: ~60-100 well-established claims, balanced across SUPPORTS/REFUTES/INSUFFICIENT, including the seven validation claims and several unknowable/obscure claims, each with a label-source URL and needs_human_review: true. Only include facts you are certain about; label uncertain ones INSUFFICIENT or omit. This set is report-only and never used for tuning.
- Record live retrievals to data/eval/snapshots/ (passages, timestamps, revision ids) with a replay mode so evaluation is reproducible offline.
- evaluation/run_eval.py writes reports/ with: per-class precision/recall, macro-F1, abstention rate, coverage-vs-accuracy, ECE (if calibrated), retrieval recall against label-source pages, latency percentiles, comparison against baseline v2 (which cannot abstain; state this), commit SHA, model revisions. Note that the recommended NLI model was trained on FEVER/ANLI, so FEVER-based numbers would be contaminated; do not report them as honest generalization.
- Report the seven validation claims' actual outcomes. Some may be INSUFFICIENT or wrong. Report it as it is and analyze why. Do not patch for them.
Gate: reports exist with real numbers.

============================================================
10. PHASE 6: API v1
============================================================
Flask app factory in backend/app.py; blueprint in backend/api_v1/ (routes, schemas (pydantic v2), errors, security, logging_setup); backend/wsgi.py.
Endpoints under /api/v1: POST /verify; POST /verify/batch (cap default 10); POST /verify/article (text only, capped); GET /health/live; GET /health/ready (models loaded, config valid, provider summary); GET /version; GET /models. Keep /api/analyze as deprecated legacy returning the old shape plus a `warning` field explaining that it is a pattern baseline, not evidence-based.
/verify request: {"claim": str, "options": {"include_baseline": bool, "max_evidence": int}}. Response includes: request_id, pipeline_version, claim{text, entities, quantities}, verdict, evidence_strength, strength_band, calibration, flags, evidence[{id, stance, passage, relevance, nli{entail,neutral,contradict}, weight, source{provider,title,url,permalink,revision_id,domain,source_type,published_at,retrieved_at,license}}], aggregation, retrieval{queries, providers[...]}, explanation{summary, steps}, models{...}, limitations, timing_ms. Baseline appears only when requested, under models.baseline/diagnostics, labeled non-evidence.
Errors: {"error":{"code","message","request_id","details"}} with 400 validation, 401 API key, 413 too large, 415 content type, 429 rate limit, 503 models not ready, 500 unexpected. Provider failures return 200 with statuses/flags. INSUFFICIENT is a valid 200 result.

============================================================
11. PHASE 7: FRONTEND
============================================================
Use the file index.html actually loads (determined in Phase 0); leave the other file untouched and document. Call /api/v1/verify. Display: claim; three-state verdict badge (Supports / Refutes / Insufficient evidence); evidence-strength band with an "uncalibrated" note; evidence cards (quotation, stance, source name, link, date, provider, relevance); contradictions section when `contested`; provider-status panel; reasoning steps; uncertainty and limitations banner; model/version footer; batch/article table view; loading, error, empty states. Render evidence text with textContent, never innerHTML. Remove any copy implying evidence was used when it was not. Baseline hidden by default. Show only data the API returned.

============================================================
12. PHASE 8: SECURITY
============================================================
Pydantic validation; claim <= 1000 chars, batch <= 10, article <= 20,000 chars (configurable); MAX_CONTENT_LENGTH; JSON-only content type; Flask-Limiter per-IP limits (document the shared-store need for multi-worker accuracy); optional X-API-Key (constant-time comparison, env-configured); CORS allowlist from env (no wildcard by default); security headers (X-Content-Type-Options, Referrer-Policy, CSP for the static frontend); .env git-ignored; no secrets in logs or the image; non-root container; pinned dependencies; pip-audit report saved in reports/. Document the privacy fact that claims are sent to Wikipedia and any enabled provider.

============================================================
13. TESTING
============================================================
pytest markers: unit, integration, model, live, e2e (register in config). Default run = unit + integration.
- unit: settings, http client, queries, chunking, RRF, dedup, aggregation/abstention, numeric extraction, schema validation, error mapping.
- integration: full pipeline on recorded real provider responses; API contract tests via test client covering every endpoint and error code.
- model: NLI smoke tests; metamorphic tests (a claim and its minimally negated form must not both be SUPPORTS on identical evidence).
- live: real Wikipedia calls.
- e2e: start the server, hit /verify and health endpoints; if Playwright is available use it for UI checks, otherwise verify via API + static code review and state explicitly that the UI was not visually verified.
- guard tests: (1) scan source (excluding tests/ and data/eval/) proving none of the seven validation claim strings or per-claim branches exist; (2) with all providers mocked empty the verdict is INSUFFICIENT with `no_evidence`; (3) every returned evidence item traces to a recorded provider call; (4) schema rejects evidence lacking provider/URL; (5) NLI-unavailable -> 503, never a heuristic verdict.
- Preserve and run all pre-existing tests. Report real counts.

============================================================
14. PHASE 9: DEPLOYMENT READINESS
============================================================
- Dev on Windows: scripts/run_dev.ps1 using Waitress. Container: Gunicorn (2 workers, a few threads, --preload, timeout ~120), torch threads from env.
- Dockerfile: multi-stage, python:3.11-slim, CPU-only torch wheel, non-root user, HEALTHCHECK on /api/v1/health/live. scripts/download_models.py fetches pinned model revisions into an HF_HOME volume (or a build arg to bake them in).
- docker-compose.yml: one service plus a models/cache volume. .dockerignore. Requirements split into requirements/{base,api,dev}.txt reconciled with the existing files.
- .env.example lists every variable with no real values.
- Startup: models load, readiness false until done. Shutdown: graceful on SIGTERM. Failures degrade visibly.
- Docs: README.md update; docs/ARCHITECTURE.md, API.md, DEPLOYMENT.md, MODEL_CARD.md (models, licences, training-data contamination caveat), LIMITATIONS.md. DEPLOYMENT.md must state what a real cloud deployment would additionally require (TLS, secrets manager, shared rate-limit store, log shipping) and must not claim it has been deployed.
- Try `docker build` and container start. If Docker is unavailable, state so and mark the Dockerfile untested.

============================================================
15. REPO STRUCTURE TARGET
============================================================
Keep existing files where they are. Add:
backend/api_v1/, backend/wsgi.py; verification_module/{claims,retrieval,reasoning,evaluation}/; verification_module/adapters/local_corpus_adapter.py; data/eval/; models/registry.json; reports/; scripts/; docs/; requirements/; Dockerfile; docker-compose.yml; .dockerignore; .env.example; .gitignore updates.

============================================================
16. EXECUTION RULES
============================================================
- Work phase by phase in order 0->9; do not start a phase before the previous gate passes; commit each phase.
- Reuse and extend existing verification_module code; do not rebuild working pieces from scratch.
- Install dependencies and download models yourself (pinned versions/revisions). Record what was installed.
- Run tests after each phase; fix root causes, never mask failures.
- Measure latency on this CPU and report real numbers. Do not assume.
- If something cannot be done in this environment (Docker missing, network blocked, model download fails), say so and record the exact error. Do not simulate it.

============================================================
17. ACCEPTANCE CRITERIA (verify each; report pass/fail with evidence)
============================================================
1. Baseline artifacts, datasets and nlp_pipeline_v2.py intact; registry hashes recorded; original tests pass.
2. Guard test green: no hardcoded claims, keyword truth rules or label inversion.
3. Wikipedia retrieval returns real passages; every evidence item has provider, URL, permalink/revision, retrieved_at, and passage text.
4. Empty providers -> INSUFFICIENT with `no_evidence`.
5. No silent provider failures; statuses appear in the API response.
6. Verdicts derive only from NLI aggregation; NLI unavailable -> 503.
7. All /api/v1 endpoints work and match schemas; each error code has a test.
8. Frontend shows verdict, evidence, sources, provider status, uncertainty and contradictions, with no innerHTML of evidence.
9. Evaluation reports exist with real per-class metrics, abstention, retrieval recall, latency, baseline comparison, model revisions; shortfalls stated.
10. Seven validation claims reported with actual outcomes, not required to "pass".
11. Unit + integration tests green; model/live/e2e results reported with any failures shown.
12. Docker build and health check verified, or explicitly reported as unverified.
13. Docs complete; .env.example has no secrets; LIMITATIONS.md exists.
14. Final report distinguishes verified from unverified and makes no deployment or unqualified production-readiness claims.

============================================================
18. FINAL REPORT (required format)
============================================================
End with: (a) what was implemented, mapped to phases; (b) files changed/created; (c) commands run and real outputs (test counts, eval metrics, latency); (d) the seven validation claims' actual results and analysis of any misses; (e) acceptance-criteria checklist with pass/fail; (f) known limitations and unverified items; (g) what remains in ARCHITECT-FOR-FUTURE and REQUIRES-EXTERNAL-INFRA. Do not overstate. Do not claim deployment.