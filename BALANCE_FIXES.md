# BALANCE_FIXES — Team Handover

## 1. Purpose

This file records the working state after the recent decision-pipeline and evaluation-framework work. It is a continuation guide covering completed implementation, limitations, cautions, commands, and the next research tasks. It does not claim that planned work is already implemented.

## 2. Project location

```text
E:\Fake-News-Misinformation-Intelligent-System
```

## 3. Current working state

The repository contains a Flask backend, browser frontend, saved REAL/FAKE article classifier, NLP/claim extraction, evidence retrieval and verification, a final-decision layer, an external-evaluation framework, and automated tests. Flask starts with the saved model in the current workspace. The project is suitable for a Review 2 execution/demo, with the limitations in this handover stated clearly.

The main external-generalization research task is still pending: `evaluation/external_evaluation.csv` has a header but no valid articles. No external benchmark metrics exist.

## 4. Completed work

- [x] Active article-level REAL/FAKE classifier: word and character TF-IDF with LinearSVC.
- [x] Saved active model at `models/fake_news_model.joblib` and accompanying metrics at `models/model_metrics.json`.
- [x] Flask server, startup metrics report, and routes for health, metrics, analyze, verify, and combined check.
- [x] NLP preprocessing, entity recognition fallback, and claim extraction.
- [x] Evidence retrieval adapters for Wikipedia and optional NewsAPI, GNews, Google Custom Search, and Google Fact Check Tools.
- [x] Provider status/error handling; provider errors do not count as negative evidence.
- [x] Separate classifier/evidence outputs and transparent combination in `backend/final_decision.py`.
- [x] ±1 LinearSVC margin abstention state (`SUSPICIOUS / UNCERTAIN`).
- [x] Frontend integration with evidence/source modal and score-semantics wording.
- [x] External evaluation CSV schema and exclusion log schema; neither contains article records.
- [x] Saved-model external evaluator and text/title leakage audit.
- [x] Documentation for benchmark collection, labeling, provenance, leakage review, interpretation, and multi-claim design (design only).
- [x] Main README and dataset README aligned with the inspected active source paths.
- [x] Current full test suite: 43 passed, with 9 separate v2 scikit-learn artifact warnings.

## 5. Important current metrics

Training data after cleaning: **4,572** records — 2,278 REAL and 2,294 FAKE. The saved 80/20 stratified random split used seed 42, with 3,657 train and 915 test articles.

| Metric on current random holdout | Value |
| --- | ---: |
| Accuracy | 96.28% |
| Macro F1 | 96.28% |
| ROC AUC | 99.32% |
| REAL precision / recall / F1 | 97.31% / 95.18% / 96.23% |
| FAKE precision / recall / F1 | 95.31% / 97.39% / 96.34% |
| Training accuracy | 100.00% |

Confusion matrix (rows actual, columns predicted; order REAL, FAKE): `[[434, 22], [12, 447]]`.

The ±1 margin audit on the same test split found 448/915 abstained (48.96%), 467/915 decisive (51.04% coverage), and 100% accuracy on the decisive subset. That is a subset result, **not overall 100% accuracy**. The 96.28% metrics describe this random split, not real-world/generalization accuracy.

An approximate train/test word unigram/bigram TF-IDF scan flagged:

| Maximum similarity | Test articles flagged | Share of 915 |
| --- | ---: | ---: |
| ≥0.90 | 34 | 3.72% |
| ≥0.95 | 21 | 2.30% |
| ≥0.98 | 12 | 1.31% |
| ≥0.99 | 8 | 0.87% |

These are lexical similarity flags; they do not prove duplicate articles. The training CSV has only `idd`, `title`, `text`, and `label`; it has no usable publisher/date fields. Source-held-out and time-held-out results cannot currently be produced.

## 6. Current model behavior

- Production article classifier: word TF-IDF (unigrams/bigrams, up to 60,000 features) + character `char_wb` TF-IDF (3–5 character n-grams, up to 80,000 features) + LinearSVC (`C=10.0`).
- A positive signed margin is FAKE; a negative signed margin is REAL. `margin >= 1` and `margin <= -1` are decisive; the interior is `SUSPICIOUS / UNCERTAIN`.
- Short inputs of at most 25 words and 2 sentences bypass article classification in the NLP pipeline.
- LinearSVC scores are not calibrated probabilities. Compatibility fields named `fake_probability`/`real_probability` are uncalibrated sigmoid display scores; `probability_calibrated` is false.
- The classifier estimates text resemblance to its training labels. It is not a claim-verification model.

## 7. Evidence verification status

The main `/api/check` pipeline selects one representative extracted claim for long input, generates concise searches, retrieves evidence, applies rule-based source credibility and lexical stance checks, then passes both signals to the final-decision layer. It does not verify every statement in the article and is not a production-grade NLI fact checker.

Wikipedia is enabled without a key. Optional providers read `NEWSAPI_KEY`, `GNEWS_KEY`, `GOOGLE_CSE_KEY`, `GOOGLE_CSE_CX`, and `GOOGLE_FACTCHECK_KEY` from environment/local ignored configuration. Unconfigured providers are skipped. Errors are surfaced as provider status, not negative evidence. Provider quotas, network access, indexing, and source quality affect results.

The separately registered `/api/v1` service includes a DeBERTa MNLI/FEVER/ANLI evidence pipeline and a distinct PyTorch/FEVER claim-model baseline. It has separate readiness/model paths and should not be confused with the browser's combined `/api/check` route or the article classifier's metrics.

## 8. External evaluation status

- `evaluation/external_evaluation.csv`: header only; **0 valid external articles**.
- `evaluation/excluded_articles.csv`: header only; no candidate exclusions recorded.
- `scripts/evaluate_external.py`: loads the existing artifact without fitting; requires at least 100 valid, provenance-checked records before writing metrics.
- `scripts/audit_external_evaluation.py`: checks exact and normalized article text, within-set duplicates, high TF-IDF text similarity, and title overlap. Default thresholds: article 0.95, title 0.85. It does not modify records.
- Results are written under `evaluation/results/`, separately from production `models/model_metrics.json`.

No external performance number should be reported until the set is supplied, reviewed, frozen, and evaluated. The evaluation set must never enter training, feature selection, model/hyperparameter selection, or threshold tuning.

## 9. Exact next tasks

### Priority 1 — Recheck the receiving environment

Run the test suite and start Flask. Check `/api/health`, `/api/model-metrics`, `/api/analyze`, `/api/verify`, and `/api/check`. Distinguish an API smoke demonstration from a live external-provider check.

### Priority 2 — Prepare the Review 2 demo

Show longer REAL/FAKE/uncertain classifier cases, a short claim where classification is skipped, evidence queries and provider status, and a combined decision. State that demo inputs are not benchmark data and do not promise specific live search results.

### Priority 3 — Collect the external benchmark

Target 100–200 traceable articles; a balanced first batch such as 50 REAL and 50 FAKE is a practical starting point. Include varied Indian and international publishers, topics, and dates. Each label must have traceable verification notes. Do not fabricate/generated articles, labels, provenance, dates, URLs, or evidence. Record unsuitable candidates and why in `evaluation/excluded_articles.csv`.

### Priority 4 — Review leakage before freezing

Run the audit. Manually inspect exact, normalized, title, and TF-IDF flags. Similarity is a heuristic. Adjudicate by provenance and content; retain documented exclusion decisions. Do not silently delete flags or alter data just to improve scores.

### Priority 5 — Freeze and evaluate

Freeze the article set and protocol. Run the evaluator only after at least 100 valid records are present. Report overall and per-class metrics, confusion matrix, abstention/coverage, decisive-subset results, exclusions, overlap, and source/topic/year distributions. Compare external Macro F1 with 96.28% random-split Macro F1 as separate scores; never average them.

### Priority 6 — Decide research changes from evidence

If external performance is lower, inspect label quality, topic/source mix, temporal shift, and overlap before proposing model changes. Do not retrain or target 98% using this benchmark. Consider source/date metadata and source/time-held-out evaluation before model optimization.

## 10. Commands teammates need

Run from the repository root in PowerShell.

| Task | Command |
| --- | --- |
| First-time environment | `py -m venv .venv` then `.venv\Scripts\python.exe -m pip install -r requirements.txt` |
| Start Flask | `.\start_flask_server.bat` |
| Python fallback | `.venv\Scripts\python.exe -m backend.app` |
| Full test suite | `.venv\Scripts\python.exe -m pytest -q` |
| External leakage audit | `.venv\Scripts\python.exe scripts\audit_external_evaluation.py` |
| External classifier evaluation (requires ≥100 valid records) | `.venv\Scripts\python.exe scripts\evaluate_external.py` |
| Inspect setup | `Get-Content requirements.txt` |

The training command is `.venv\Scripts\python.exe -m ml.train`; it overwrites the production model and metrics. Do not run it as a demo/setup step. Run it only as part of a deliberate, documented retraining plan.

Optional evidence keys are configured locally using `verification_module/.env.example` as a template. Never place actual values in this file or source control; the real `.env` is ignored.

## 11. Important files and change caution

| File | Purpose | Change guidance |
| --- | --- | --- |
| `backend/app.py` | Flask routes and orchestration | Caution; preserve API contracts and error semantics |
| `backend/final_decision.py` | Final assessment rules | Caution; change only with explicit tests and rationale |
| `ml/classifier.py` | TF-IDF/LinearSVC feature and score behavior | Caution; impacts saved artifact compatibility and margins |
| `ml/train.py` | Article-data cleaning, split, training, metrics/artifact save | Caution; running it overwrites production outputs |
| `models/fake_news_model.joblib` | Production classifier bundle | **Do not modify casually**; keep provenance/checksum |
| `models/model_metrics.json` | Saved random-holdout metrics | **Do not edit to change reported performance** |
| `data/fake_and_real_news_dataset.csv` | Production training data | **Do not relabel or append evaluation records casually** |
| `evaluation/external_evaluation.csv` | Frozen external test records when available | Never train/tune on it; preserve provenance |
| `evaluation/excluded_articles.csv` | Candidate exclusion log | Add only real candidate metadata and a specific reason |
| `evaluation/README.md` | Benchmark protocol | Update when protocol/scripts change |
| `scripts/evaluate_external.py` | Saved-model benchmark evaluation | Evaluation-only; must not fit/save production model |
| `scripts/audit_external_evaluation.py` | Duplicate/leakage flags | Review results; script does not delete rows |
| `README.md` | Main project/handover document | Keep aligned with actual implementation |
| `BALANCE_FIXES.md` | Team continuation notes | Keep current as work is completed |

## 12. Known problems and limitations

### Technical limitations

- The active score is uncalibrated; no probability calibration is implemented.
- Abstention reduces coverage to about 51% on the current random holdout.
- Startup metrics output currently shows training accuracy `N/A` because of a JSON nesting mismatch, even though the saved metrics file records 1.0.
- The full test suite emits nine scikit-learn version warnings for separate v2 artifacts saved with 1.7.2 and loaded with 1.9.1.
- In the last startup check, NLTK reported WordNet missing in the restricted environment; the Flask app nevertheless started. Network/resource setup can differ on another machine.

### Dataset limitations

- Only a few thousand cleaned examples and limited source/topic diversity.
- No reliable publisher or publication date; `idd` is opaque and is not source provenance.
- Training accuracy is 100%; random split and near-duplicate flags may make its holdout score optimistic.
- No source-held-out/time-held-out result exists.

### Evidence limitations

- Main pipeline uses retrieval and heuristic/lexical stance, not a production-grade fact-checking NLI model.
- Only one representative extracted claim is checked for long inputs.
- Sources can be stale, weak, duplicated, unrelated, or unavailable; a failed search yields uncertainty, not a false finding.

### Evaluation limitations

- External evaluation schema exists, but currently has no verified rows and produces no external metrics.
- The 100–200 article benchmark will still be limited in representativeness; it cannot justify a broad real-world accuracy claim.
- TF-IDF text/title similarity flags are heuristics and require manual adjudication.

### Demo limitations

- Live provider results can vary by API configuration, network, quotas, and indexing.
- `/api/v1/health/ready` may require loading its separate evidence model; it is not required for the basic Flask UI demo.

## 13. Things not to do

- Do not change the margin threshold, final-decision rules, or model hyperparameters casually.
- Do not retrain merely to raise a displayed score or overwrite the saved production model without documenting a deliberate plan.
- Do not fabricate benchmark articles, sources, URLs, labels, publication dates, or evidence; do not use generated fake articles.
- Do not use external evaluation data for training, threshold/model tuning, feature selection, or model selection.
- Do not call SVM compatibility scores calibrated probabilities.
- Do not claim every article sentence was fact-checked.
- Do not describe 96.28% as real-world accuracy or decisive-subset 100% as overall accuracy.
- Do not silently discard leakage flags or remove failing tests to hide regressions.
- Do not change API response contracts without checking the frontend and tests.
- Do not commit `.env` or expose API keys.

## 14. Review 2 talking points

1. The system combines article text classification with a separate evidence search/verification path.
2. The article classifier is word/character TF-IDF with LinearSVC; its ±1 raw-margin rule abstains on uncertain inputs.
3. The random held-out split achieved 96.28% Macro F1, but there is no source/time-held-out evidence to claim generalization.
4. The verifier checks retrieved passages for one focal claim in long input; it does not verify every statement.
5. Provider failure is not treated as a negative stance; the final layer can return UNVERIFIED or SUSPICIOUS/UNCERTAIN.
6. The external benchmark framework is ready, but collecting independently verified and leakage-reviewed records remains future work.

## 15. Recommended future improvements

1. Collect and freeze a traceable external benchmark.
2. Add source and date metadata to a separately versioned development/evaluation dataset.
3. Run source-held-out and time-held-out evaluation.
4. Improve claim extraction and claim ranking.
5. Improve evidence relevance/ranking and source independence handling.
6. Evaluate a stronger NLI/evidence verification path.
7. Consider probability calibration only after collecting representative calibration data.
8. Improve the size and diversity of the training data with verified provenance.
9. Improve result reporting while keeping classifier, evidence, and final status distinct.

These are future tasks, not claims of implemented functionality.

## 16. Final handover summary

The project is currently runnable and suitable for a Review 2 execution/demo. The main unfinished research task is external generalization evaluation using a traceable benchmark dataset. The next team should preserve the existing production model and evaluation integrity while completing the benchmark and considering future improvements only after reviewing the evidence.
