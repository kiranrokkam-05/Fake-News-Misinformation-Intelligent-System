# Fake-News-Misinformation-Intelligent-System

## NLP & ML Developer Implementation

This version connects the existing frontend to a Python NLP/ML backend that performs **binary claim classification**:

- `TRUE`
- `FALSE`

The active backend pipeline is implemented in [backend/nlp_pipeline.py](./backend/nlp_pipeline.py) and provides:

1. Text preprocessing and normalization
2. Tokenization
3. TF-IDF feature extraction
4. PyTorch neural-network binary classification
5. Confidence calculation from class probabilities
6. REST API for frontend integration
7. End-to-end prediction from user claim to dashboard result

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

`setup_ml.py` trains the active binary classifier using:

- [data/fake_and_real_news_dataset.csv](./data/fake_and_real_news_dataset.csv)

Saved artifacts (separate from older models):

- `models/pytorch_claim_binary_model.pt`
- `models/pytorch_claim_binary_tfidf.joblib`
- `models/pytorch_claim_binary_label_encoder.joblib`
- `models/pytorch_claim_binary_metrics.json`

Label handling:

- `REAL` is mapped to `TRUE`
- `FAKE` is mapped to `FALSE`

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

Response includes prediction (`TRUE`/`FALSE`), confidence percentage, model metadata, and per-class probabilities.

## Dataset

The active pipeline expects a binary-labeled dataset with a `label` column containing either:

- `TRUE` / `FALSE`, or
- `REAL` / `FAKE` (normalized internally to `TRUE` / `FALSE`)

The current bundled dataset already satisfies this requirement.

## Important

Do not open `index.html` directly with `file://` for the ML version. Start the Flask server so the frontend can call `/api/analyze`.
