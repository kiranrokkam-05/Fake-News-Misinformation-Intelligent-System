"""Evaluate the saved article classifier on an independent labeled CSV.

This script is read-only with respect to production artifacts: it loads the
existing joblib model, never calls fit/train, and writes results only to the
evaluation output path.
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_recall_fscore_support,
)

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from ml.classifier import FakeNewsClassifier

LABELS = {"REAL": 0, "TRUE": 0, "0": 0, "FAKE": 1, "FALSE": 1, "1": 1}
CLASS_NAMES = ["REAL", "FAKE"]
MARGIN_THRESHOLD = 1.0
MINIMUM_BENCHMARK_SIZE = 100
REQUIRED_COLUMNS = {
    "id", "title", "text", "label", "source", "publication_date",
    "source_url", "verification_date", "verification_notes",
}


def _metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    precision, recall, f1, support = precision_recall_fscore_support(
        y_true, y_pred, labels=[0, 1], zero_division=0
    )
    return {
        "sample_count": int(len(y_true)),
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "macro_f1": float(f1_score(y_true, y_pred, labels=[0, 1], average="macro", zero_division=0)),
        "classes": {
            name: {
                "precision": float(precision[index]),
                "recall": float(recall[index]),
                "f1": float(f1[index]),
                "support": int(support[index]),
            }
            for index, name in enumerate(CLASS_NAMES)
        },
        "confusion_matrix_rows_actual_columns_predicted_real_then_fake": confusion_matrix(
            y_true, y_pred, labels=[0, 1]
        ).tolist(),
    }


def _distribution(values: pd.Series) -> dict:
    normalized = values.fillna("Not supplied").astype(str).str.strip().replace("", "Not supplied")
    return {str(key): int(value) for key, value in normalized.value_counts().sort_index().items()}


def _valid_http_url(value: object) -> bool:
    try:
        parsed = urlsplit(str(value))
        return parsed.scheme in {"http", "https"} and bool(parsed.netloc)
    except ValueError:
        return False


def evaluate(dataset_path: Path, model_path: Path, output_path: Path, exclusions_path: Path) -> dict | None:
    if not dataset_path.is_file():
        raise FileNotFoundError(f"Evaluation CSV not found: {dataset_path}")
    frame = pd.read_csv(dataset_path)
    missing = sorted(REQUIRED_COLUMNS - set(frame.columns))
    if missing:
        raise ValueError(f"Evaluation CSV is missing required columns: {', '.join(missing)}")
    if frame.empty:
        print("No external evaluation articles are available; CSV contains only a header. No metrics were calculated or saved.")
        return None

    titles = frame["title"].fillna("").astype(str) if "title" in frame else pd.Series([""] * len(frame))
    texts = frame["text"].fillna("").astype(str)
    input_texts = (titles + " " + texts).str.strip().tolist()
    y_mapped = frame["label"].astype(str).str.strip().str.upper().map(LABELS)
    missing_fields = {
        column: frame[column].isna() | frame[column].astype(str).str.strip().eq("")
        for column in REQUIRED_COLUMNS
    }
    missing_required = pd.DataFrame(missing_fields).any(axis=1)
    publication_dates = pd.to_datetime(frame["publication_date"], format="%Y-%m-%d", errors="coerce")
    verification_dates = pd.to_datetime(frame["verification_date"], format="%Y-%m-%d", errors="coerce")
    invalid_dates = publication_dates.isna() | verification_dates.isna()
    invalid_urls = ~frame["source_url"].map(_valid_http_url)
    duplicate_ids = frame["id"].astype(str).duplicated(keep=False)
    valid = y_mapped.notna() & ~missing_required & ~invalid_dates & ~invalid_urls & ~duplicate_ids
    dropped = int((~valid).sum())
    excluded_input_rows = []
    for index in np.flatnonzero((~valid).to_numpy()):
        reasons = []
        row = frame.iloc[index]
        missing = [field for field in REQUIRED_COLUMNS if pd.isna(row[field]) or not str(row[field]).strip()]
        if missing:
            reasons.append("missing_required_fields:" + ",".join(sorted(missing)))
        if pd.isna(y_mapped.iloc[index]):
            reasons.append("invalid_or_missing_label")
        if invalid_dates.iloc[index]:
            reasons.append("invalid_date_format_or_value")
        if invalid_urls.iloc[index]:
            reasons.append("invalid_source_url")
        if duplicate_ids.iloc[index]:
            reasons.append("duplicate_id")
        excluded_input_rows.append({"id": str(row.get("id", index)), "row": int(index), "reason": ";".join(reasons)})
    frame = frame.loc[valid].reset_index(drop=True)
    input_texts = [text for text, keep in zip(input_texts, valid.tolist()) if keep]
    y_true = y_mapped.loc[valid].astype(int).to_numpy()
    if len(frame) < MINIMUM_BENCHMARK_SIZE:
        print(
            f"Only {len(frame)} valid external articles are available; at least "
            f"{MINIMUM_BENCHMARK_SIZE} are required before benchmark metrics are emitted. No metrics were calculated or saved."
        )
        return None
    if not model_path.is_file():
        raise FileNotFoundError(f"Saved production model not found: {model_path}")

    exclusions = pd.read_csv(exclusions_path) if exclusions_path.is_file() else pd.DataFrame()
    exclusion_reasons = (
        _distribution(exclusions["exclusion_reason"])
        if "exclusion_reason" in exclusions
        else {}
    )
    publication_year = publication_dates.loc[valid].reset_index(drop=True).dt.year.astype("Int64").astype(str).replace("<NA>", "Not supplied")

    classifier = FakeNewsClassifier(model_type="linear_svc")
    classifier.load_model(str(model_path))
    if not hasattr(classifier.model, "decision_function"):
        raise TypeError("The loaded artifact does not expose the required SVM decision margin.")
    if sorted(int(label) for label in classifier.model.classes_) != [0, 1]:
        raise ValueError("The saved model classes do not match REAL=0 and FAKE=1.")

    features = classifier._prepare_features(input_texts, fit=False)
    raw_predictions = np.asarray(classifier.model.predict(features), dtype=int)
    margins = np.asarray(classifier.model.decision_function(features), dtype=float).reshape(-1)
    decisive = np.abs(margins) >= MARGIN_THRESHOLD
    result = {
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "evaluation_dataset": str(dataset_path.resolve()),
        "model_artifact": str(model_path.resolve()),
        "model_type": classifier.model_type,
        "training_performed": False,
        "production_artifacts_modified": False,
        "rows_read": int(len(valid)),
        "rows_evaluated": int(len(y_true)),
        "rows_skipped_empty_or_invalid_label": dropped,
        "valid_benchmark_minimum": MINIMUM_BENCHMARK_SIZE,
        "minimum_met": len(y_true) >= MINIMUM_BENCHMARK_SIZE,
        "excluded_rows_in_evaluation_csv": excluded_input_rows,
        "excluded_articles_log": {
            "path": str(exclusions_path.resolve()),
            "count": int(len(exclusions)),
            "reasons": exclusion_reasons,
        },
        "dataset_distributions": {
            "source": _distribution(frame["source"]) if "source" in frame else {},
            "topic": _distribution(frame["topic"]) if "topic" in frame else {},
            "publication_year": _distribution(publication_year),
        },
        "label_mapping": {"REAL": 0, "FAKE": 1},
        "overall_classifier_predictions": _metrics(y_true, raw_predictions),
        "abstention_and_coverage": {
            "rule": "decisive when abs(LinearSVC decision_margin) >= 1.0; otherwise abstain",
            "threshold": MARGIN_THRESHOLD,
            "abstained_count": int((~decisive).sum()),
            "abstention_rate": float((~decisive).mean()),
            "decisive_count": int(decisive.sum()),
            "coverage": float(decisive.mean()),
        },
        "decisive_subset_only": _metrics(y_true[decisive], raw_predictions[decisive]) if decisive.any() else None,
        "notes": [
            "Overall prediction metrics include every evaluated row, including samples the production classifier abstains on.",
            "Decisive-subset metrics include only rows whose absolute SVM margin is at least the existing threshold.",
            "These are article-classification metrics, not evidence that individual claims are factually true.",
        ],
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2))
    print(f"\nSaved evaluation report to {output_path}")
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", type=Path, default=ROOT / "evaluation" / "external_evaluation.csv")
    parser.add_argument("--model", type=Path, default=ROOT / "models" / "fake_news_model.joblib")
    parser.add_argument("--output", type=Path, default=ROOT / "evaluation" / "results" / "external_evaluation_metrics.json")
    parser.add_argument("--exclusions", type=Path, default=ROOT / "evaluation" / "excluded_articles.csv")
    args = parser.parse_args()
    try:
        evaluate(args.dataset, args.model, args.output, args.exclusions)
    except Exception as exc:
        print(f"External evaluation failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
