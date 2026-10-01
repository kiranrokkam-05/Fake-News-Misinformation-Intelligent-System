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
    print("\nEvaluation metrics")
    print(f"Accuracy:            {report['accuracy']:.4f} ({report['accuracy'] * 100:.2f}%)")
    print(f"Validation accuracy: {report['validation_accuracy']:.4f} ({report['validation_accuracy'] * 100:.2f}%)")
    print(f"Precision (macro):   {report['precision']:.4f} ({report['precision'] * 100:.2f}%)")
    print(f"Recall (macro):      {report['recall']:.4f} ({report['recall'] * 100:.2f}%)")
    print(f"F1 score (macro):    {report['f1']:.4f} ({report['f1'] * 100:.2f}%)")
    print("\nPer-class metrics")
    for label, values in report.get('report', {}).items():
        if isinstance(values, dict) and 'precision' in values:
            print(
                f"{label}: precision={values['precision']:.4f}, "
                f"recall={values['recall']:.4f}, "
                f"f1={values['f1-score']:.4f}, "
                f"support={int(values['support'])}"
            )
