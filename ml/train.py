import os
import sys
import json

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    precision_recall_fscore_support,
    roc_auc_score,
)

from ml.classifier import FakeNewsClassifier



def load_dataset(data_dir: str = "data") -> pd.DataFrame:
    """Load and clean the project's actual REAL/FAKE article dataset."""
    dataset_path = os.path.join(data_dir, "fake_and_real_news_dataset.csv")
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found: {dataset_path}")
    source = pd.read_csv(dataset_path)
    if "label" not in source:
        raise ValueError("Dataset must include a label column.")
    if "full_text" in source:
        content = source["full_text"].fillna("").astype(str)
    elif {"title", "text"}.issubset(source.columns):
        content = source["title"].fillna("").astype(str) + " " + source["text"].fillna("").astype(str)
    else:
        raise ValueError("Dataset must include full_text or both title and text columns.")
    labels = source["label"].astype(str).str.strip().str.upper().map(
        {"REAL": 0, "TRUE": 0, "0": 0, "FAKE": 1, "FALSE": 1, "1": 1}
    )
    frame = pd.DataFrame({"full_text": content.str.strip(), "label": labels})
    frame = frame.dropna().drop_duplicates(subset="full_text")
    frame = frame[frame["full_text"].str.len() >= 20].reset_index(drop=True)
    if set(frame["label"].unique()) != {0, 1}:
        raise ValueError("Dataset must contain both REAL and FAKE labels.")
    return frame


def train_and_evaluate_model(
    model_output_path: str = "models/fake_news_model.joblib",
    sample_limit: int = 12000
) -> None:
    """
    Trains the FakeNewsClassifier, evaluates metrics, and saves trained model weights.
    """
    print("=== Training NLP & ML Fake News Classifier ===")
    df = load_dataset()
    
    # Subsample for fast training execution
    if len(df) > sample_limit:
        df = df.sample(n=sample_limit, random_state=42).reset_index(drop=True)

    print(f"Dataset Loaded: {len(df)} samples ({sum(df['label'] == 1)} Fake, {sum(df['label'] == 0)} Real)")

    X = df['full_text'].tolist()
    y = df['label'].tolist()

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    classifier = FakeNewsClassifier(model_type="linear_svc")
    
    print("Training model...")
    train_results = classifier.train(X_train, y_train)
    print(f"Training Complete! Features: {train_results['feature_dimension']}, Training Accuracy: {train_results['training_accuracy']}")

    # Evaluation on Test set
    test_features = classifier._prepare_features(X_test, fit=False)
    y_pred = classifier.model.predict(test_features).tolist()

    acc = accuracy_score(y_test, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='binary')
    macro_f1 = f1_score(y_test, y_pred, average="macro")
    test_scores = classifier.model.decision_function(test_features)
    roc_auc = roc_auc_score(y_test, test_scores)

    print("\n--- Test Set Performance Evaluation ---")
    print(f"Accuracy:  {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall:    {rec * 100:.2f}%")
    print(f"F1-Score:  {f1 * 100:.2f}%")
    print(f"Macro F1:  {macro_f1 * 100:.2f}%")
    print(f"ROC AUC:   {roc_auc * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["REAL", "FAKE"]))

    # Save model artifact
    classifier.save_model(model_output_path)
    print(f"Model successfully saved to {os.path.abspath(model_output_path)}")

    metrics_path = os.path.join(os.path.dirname(model_output_path), "model_metrics.json")
    metrics = {
        "best_model": "linear_svc_word_char_tfidf",
        "training_rows": len(X_train),
        "classes": ["REAL", "FAKE"],
        "metrics": {
            "linear_svc_word_char_tfidf": {
                "accuracy": float(acc),
                "precision": float(prec),
                "recall": float(rec),
                "f1": float(f1),
                "macro_f1": float(macro_f1),
                "roc_auc": float(roc_auc),
            }
        },
        "training_accuracy": train_results["training_accuracy"],
        "test_rows": len(X_test),
        "features": {"word_tfidf_max_features": 60000, "char_tfidf_max_features": 80000},
        "regularization": {"linear_svc_c": 10.0},
    }
    with open(metrics_path, "w", encoding="utf-8") as metrics_file:
        json.dump(metrics, metrics_file, indent=2)
    print(f"Training metrics saved to {os.path.abspath(metrics_path)}")


if __name__ == "__main__":
    train_and_evaluate_model()
