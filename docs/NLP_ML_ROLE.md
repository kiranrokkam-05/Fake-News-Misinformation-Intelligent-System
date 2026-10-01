# NLP & ML Developer — Role Completion

## Implemented responsibilities

| Responsibility | Implementation |
|---|---|
| Text preprocessing | URL/HTML removal, normalization, whitespace and punctuation cleanup |
| Tokenization | Regex word tokenization with stopword filtering |
| Claim extraction | Sentence segmentation and candidate-claim extraction |
| NER | Offline pattern-based entity extraction for dates, organizations, locations and names |
| Embeddings | TF-IDF vector representation used as semantic feature embeddings |
| Semantic similarity | Cosine similarity between the input and extracted claims |
| ML classification | Logistic Regression, Random Forest and XGBoost |
| Confidence calculation | Maximum class probability from the selected model |
| Model selection | Highest weighted validation F1 score |
| Backend API | Flask `/api/analyze`, `/api/health`, `/api/model-metrics` |
| Frontend integration | `index.html`/`app.js` calls the backend and displays real analysis |
| End-to-end prediction | User claim → NLP → embeddings → 3 classifiers → best model → confidence → dashboard |

## Training evaluation

After `python setup_ml.py`, open `models/model_metrics.json` to see accuracy, precision, recall, F1 and ROC-AUC for each model. The frontend reports the model selected by weighted F1.
