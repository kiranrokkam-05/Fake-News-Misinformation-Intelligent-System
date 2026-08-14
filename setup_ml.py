"""One-command setup for the real NLP/ML pipeline.

Downloads a public Fake/Real News CSV and trains Logistic Regression,
Random Forest, and XGBoost (when available), then stores the selected model.
"""
from pathlib import Path
from urllib.request import urlopen
import sys

# Always make the project root importable, even when this script is launched
# from another working directory or by a batch file.
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.nlp_pipeline import train_models
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
DATASET = DATA_DIR / "fake_and_real_news_dataset.csv"
DATASET_URL = "https://raw.githubusercontent.com/GeorgeMcIntire/fake_real_news_dataset/main/fake_and_real_news_dataset.csv"


def download_dataset():
    if DATASET.exists() and DATASET.stat().st_size > 1000:
        print(f"Dataset already exists: {DATASET}")
        return
    print("Downloading public Fake/Real News dataset...")
    with urlopen(DATASET_URL, timeout=60) as response, open(DATASET, "wb") as out:
        out.write(response.read())
    print(f"Saved dataset: {DATASET}")


if __name__ == "__main__":
    download_dataset()
    report = train_models(str(DATASET))
    print("\nTraining complete")
    print(f"Rows: {report['training_rows']}")
    print(f"Best model: {report['best_model']}")
    for name, metrics in report["metrics"].items():
        print(name, metrics)
