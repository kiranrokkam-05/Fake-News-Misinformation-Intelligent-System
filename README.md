# Fake-News-Misinformation-Intelligent-System

## NLP & ML Developer Implementation

This version connects the existing frontend to a real Python NLP/ML backend. The live API uses the fake/real misinformation pipeline in `nlp/` and `ml/`, and exposes optional evidence verification from `verification_module/`.

1. Text preprocessing and normalization
2. Claim/entity extraction and linguistic analysis
3. Fake/real classification with calibrated confidence
4. REST API for frontend integration
5. Optional evidence retrieval, source scoring, and explainable verification

## Setup

Open PowerShell in the project folder and run:

```powershell
python -m pip install -r requirements.txt
python setup_ml.py
python -m backend.app
```

Then open:

```text
http://127.0.0.1:5000
```

The live API loads the trained fake/real bundle from `models/fake_news_model.joblib` and metrics from `models/model_metrics.json`.

## API

### Health

`GET /api/health`

### Model metrics

`GET /api/model-metrics`

### Analyze claim

`POST /api/analyze`

Request:

```json
{
  "text": "Your news claim here"
}
```

Response contains fake/real classification, confidence, extracted claims/entities, and preprocessing diagnostics.

### Evidence verification

`POST /api/verify` accepts `{ "claim": "Your claim here" }` and returns an explainable verification result. Only configured providers are queried; Wikipedia is enabled by default and paid providers require environment keys.

## Dataset

The project uses the public Fake/Real News dataset by George McIntire. The dataset contains real/fake news records with title/text and a REAL/FAKE label. The project does not ship a large third-party dataset inside the ZIP; `setup_ml.py` downloads it into `data/` when the user runs setup.

## Important

Do not open `frontend/index.html` directly with `file://` for the ML version. Start the Flask server so the frontend can call `/api/analyze`.

## Repository layout

- `frontend/` — browser UI (`index.html`, `app.js`, `style.css`)
- `backend/` — Flask API and backend model services
- `nlp/` — preprocessing, claim extraction, embeddings, and NLP pipeline
- `ml/` — classifiers, confidence scoring, and training utilities
- `verification_module/` — evidence adapters, retrieval, reasoning, and verification
- `models/` — trained model artifacts and registry metadata
- `data/` — datasets, samples, and evaluation corpora
- `scripts/` — setup, evaluation, and demo scripts
- `tests/` — automated tests
- `docs/` — project documentation
- `archive/project-legacy/` — preserved legacy frontend copy

Runtime verification completed successfully.
