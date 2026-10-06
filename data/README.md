# Article training dataset

`fake_and_real_news_dataset.csv` is the article-level REAL/FAKE dataset used by the active article-classifier training pipeline in `ml/train.py`. The training loader combines `title` and `text`, maps the labels to REAL (`0`) and FAKE (`1`), removes empty/duplicate content, and creates a stratified random split. Running `python -m ml.train` retrains the article classifier and replaces the files under `models/`; it is not needed to run the Flask application.

## Runtime model path

The Flask application in `backend/app.py` points `FakeNewsNLPPipeline` to `models/fake_news_model.joblib`. `nlp/pipeline.py` creates an `ml.classifier.FakeNewsClassifier` and loads that artifact. The artifact contains the fitted word/character TF-IDF vectorizers and LinearSVC. The saved random-split metrics are in `models/model_metrics.json`.

The separate PyTorch/FEVER experiments under `backend/nlp_pipeline_v2.py`, `setup_ml_v2.py`, and `data/fever/` are not the classifier loaded by the Flask route. `setup_ml.py` is a legacy setup entry point and is not the active article-classifier training command.

## Dataset provenance and limits

The bundled CSV has `idd`, `title`, `text`, and `label` columns. It does not provide usable publisher or publication-date metadata. The `idd` value is an opaque identifier and must not be interpreted as source provenance. The historical source attribution for this copy should be verified against the original dataset distribution before relying on it for provenance claims.

Do not use this file as an external evaluation set. External evaluation records belong under `evaluation/` and must include traceable provenance and independently checked labels. See [the external evaluation guide](../evaluation/README.md).
