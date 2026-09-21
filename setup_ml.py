"""One-command setup for the active backend NLP pipeline.

This project currently runs the PyTorch TF-IDF subject-classification pipeline in
`backend/nlp_pipeline.py`. The older setup script referenced a different
`train_models` API and a separate dataset flow, so this compatibility wrapper
keeps the setup command working with the real project implementation.
"""
from pathlib import Path
import sys

# Always make the project root importable, even when this script is launched
# from another working directory or by a batch file.
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.nlp_pipeline import train_models

DATA_DIR = BASE_DIR / "data_sample"
DATA_DIR.mkdir(exist_ok=True)
DATASET = DATA_DIR / "fake.csv"


def ensure_dataset():
    if DATASET.exists() and DATASET.stat().st_size > 1000:
        print(f"Dataset ready: {DATASET}")
        return
    raise FileNotFoundError(
        f"Required dataset is missing: {DATASET}. "
        "The project currently trains on the bundled sample dataset."
    )


if __name__ == "__main__":
    ensure_dataset()
    report = train_models(str(DATASET))
    print("\nTraining complete")
    print(f"Rows: {report['training_rows']}")
    print(f"Model: {report['model']}")
