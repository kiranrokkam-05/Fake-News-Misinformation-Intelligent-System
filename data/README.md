# Fake/Real News Dataset

The project is configured for the public **Fake/Real News** dataset maintained by George McIntire. The dataset contains article title/text and a REAL/FAKE label and is used by `setup_ml.py` to train the active binary classifier.

Source repository: https://github.com/GeorgeMcIntire/fake_real_news_dataset

The active Flask application uses the PyTorch binary claim-classification pipeline in
`backend/nlp_pipeline.py`. It normalizes `REAL` to `TRUE` and `FAKE` to `FALSE`,
removes duplicate article content before splitting, fits TF-IDF only on the training
partition, and saves the fitted artifacts under `models/pytorch_claim_binary_*`.

Run from the project root:

```powershell
python setup_ml.py
```

This validates the bundled dataset and trains the active PyTorch binary model.

The older Logistic Regression, Random Forest, and XGBoost implementation under
`src/ml/` is retained as legacy code and is not loaded by the active Flask route.
