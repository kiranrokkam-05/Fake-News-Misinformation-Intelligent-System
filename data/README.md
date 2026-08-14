# Fake/Real News Dataset

The project is configured for the public **Fake/Real News** dataset maintained by George McIntire. The dataset contains article title/text and a REAL/FAKE label and is used by `setup_ml.py` to train the three required classifiers.

Source repository: https://github.com/GeorgeMcIntire/fake_real_news_dataset

Run from the project root:

```powershell
python setup_ml.py
```

This downloads the dataset into this folder and trains:

- Logistic Regression
- Random Forest
- XGBoost (for binary REAL/FAKE labels)

The trained bundle and evaluation metrics are saved under `models/`.
