"""One-command setup for the active FEVER-based claim pipeline."""
from pathlib import Path
import sys

# Always make the project root importable, even when this script is launched
# from another working directory or by a batch file.
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.nlp_pipeline_v2 import TEST_DATA_PATH, TRAIN_DATA_PATH, train_model

def ensure_dataset():
    missing = [str(path) for path in (TRAIN_DATA_PATH, TEST_DATA_PATH) if not path.exists()]
    if not missing:
        print("FEVER-derived claim dataset ready")
        return
    raise FileNotFoundError(
        "Missing FEVER-derived claim data: " + ", ".join(missing)
    )


if __name__ == "__main__":
    ensure_dataset()
    report = train_model()
    print("\nTraining complete")
    print(f"Rows: {report['total_usable_samples']}")
    print(f"Model: {report['model']}")
