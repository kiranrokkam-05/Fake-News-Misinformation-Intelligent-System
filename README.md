# Fake-News-Misinformation-Intelligent-System

## NLP & ML Developer Implementation

This version connects the existing frontend to a real Python NLP/ML backend. The assigned NLP & ML Developer responsibilities are implemented as an end-to-end pipeline:

1. Text preprocessing and normalization
2. Tokenization
3. Claim extraction
4. Named Entity Recognition (lightweight offline NER)
5. TF-IDF semantic embeddings
6. Semantic similarity with cosine similarity
7. Logistic Regression classification
8. Random Forest classification
9. XGBoost classification
10. Confidence calculation from model probabilities
11. Best-model selection using validation F1 score
12. REST API for frontend integration
13. End-to-end prediction from user claim to final dashboard result

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

`setup_ml.py` downloads the public Fake/Real News dataset and trains the models. It saves the trained bundle in `models/fake_news_models.joblib` and evaluation metrics in `models/model_metrics.json`.

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

Response contains the prediction, confidence, selected model, predictions from all trained models, semantic similarity, embeddings information, extracted claims, entities, sentiment, stance, and preprocessing diagnostics.

## Dataset

The project uses the public Fake/Real News dataset by George McIntire. The dataset contains real/fake news records with title/text and a REAL/FAKE label. The project does not ship a large third-party dataset inside the ZIP; `setup_ml.py` downloads it into `data/` when the user runs setup.

## Important

Do not open `index.html` directly with `file://` for the ML version. Start the Flask server so the frontend can call `/api/analyze`.
