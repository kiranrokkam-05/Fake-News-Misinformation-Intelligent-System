"""
PyTorch NLP Binary Claim Classification Pipeline

Dataset:
    data/fake_and_real_news_dataset.csv

Required columns:
    label + (title/text or full_text)

Target:
    TRUE / FALSE
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Dict

import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / "data" / "fake_and_real_news_dataset.csv"

MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)

MODEL_PATH = MODEL_DIR / "pytorch_claim_binary_model.pt"
VECTORIZER_PATH = MODEL_DIR / "pytorch_claim_binary_tfidf.joblib"
LABEL_ENCODER_PATH = MODEL_DIR / "pytorch_claim_binary_label_encoder.joblib"
METRICS_PATH = MODEL_DIR / "pytorch_claim_binary_metrics.json"

DEVICE = torch.device("cpu")
EXPECTED_LABELS = {"TRUE", "FALSE"}
LABEL_NORMALIZATION = {
    "TRUE": "TRUE",
    "REAL": "TRUE",
    "1": "TRUE",
    "FALSE": "FALSE",
    "FAKE": "FALSE",
    "0": "FALSE",
}


try:
    STOP_WORDS = set(stopwords.words("english"))
except LookupError:
    import nltk

    nltk.download("stopwords")
    STOP_WORDS = set(stopwords.words("english"))

try:
    LEMMATIZER = WordNetLemmatizer()
    LEMMATIZER.lemmatize("test")
except LookupError:
    import nltk

    nltk.download("wordnet")
    LEMMATIZER = WordNetLemmatizer()


class ClaimClassificationModel(nn.Module):
    def __init__(self, input_size: int, num_classes: int):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, num_classes),
        )

    def forward(self, x):
        return self.network(x)


def preprocess_text(text: str) -> str:
    text = str(text or "").lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    tokens = text.split()
    tokens = [LEMMATIZER.lemmatize(token) for token in tokens if token not in STOP_WORDS]
    return " ".join(tokens)


def _normalize_label(raw_label: str) -> str:
    canonical = LABEL_NORMALIZATION.get(str(raw_label).strip().upper())
    if canonical is None:
        raise ValueError(
            "Unsupported label value found in dataset: "
            f"{raw_label!r}. Supported labels are TRUE/FALSE or REAL/FAKE."
        )
    return canonical


def load_dataset() -> pd.DataFrame:
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)
    if "label" not in df.columns:
        raise ValueError("Dataset is missing required column: label")

    has_full_text = "full_text" in df.columns
    has_title_text = "title" in df.columns and "text" in df.columns
    if not has_full_text and not has_title_text:
        raise ValueError(
            "Dataset must contain either full_text or both title and text columns."
        )

    if has_full_text:
        content = df["full_text"].fillna("").astype(str)
    else:
        content = df["title"].fillna("").astype(str) + " " + df["text"].fillna("").astype(str)

    labels = df["label"].astype(str).str.strip()
    work = pd.DataFrame({"content": content, "label": labels}).dropna()
    work["content"] = work["content"].astype(str).str.strip()
    work = work[work["content"].str.len() > 10]
    work = work.drop_duplicates(subset=["content"], keep="first")
    if work.empty:
        raise ValueError("Dataset has no usable rows after filtering empty/short content.")

    work["label"] = work["label"].apply(_normalize_label)
    found_labels = set(work["label"].unique().tolist())
    if found_labels != EXPECTED_LABELS:
        raise ValueError(
            "Binary classifier requires both TRUE and FALSE labels. "
            f"Found labels: {sorted(found_labels)}"
        )

    return work.reset_index(drop=True)


def train_models(dataset_path: str | None = None, random_state: int = 42):
    if dataset_path is not None:
        global DATASET_PATH
        DATASET_PATH = Path(dataset_path)
    return train_model(random_state=random_state)


def train_model(random_state: int = 42):
    print("\n" + "=" * 64)
    print("TRAINING PYTORCH BINARY CLAIM CLASSIFIER (TRUE/FALSE)")
    print("=" * 64)

    np.random.seed(random_state)
    torch.manual_seed(random_state)
    df = load_dataset()
    print(f"\nDataset rows: {len(df)}")
    print("\nLabel distribution:")
    print(df["label"].value_counts())

    print("\nPreprocessing text...")
    df["processed_text"] = df["content"].apply(preprocess_text)

    label_encoder = LabelEncoder()
    df["encoded_label"] = label_encoder.fit_transform(df["label"])

    classes = set(label_encoder.classes_.tolist())
    if classes != EXPECTED_LABELS:
        raise ValueError(
            "Encoded class set is invalid for binary TRUE/FALSE classifier. "
            f"Classes: {sorted(classes)}"
        )

    X_train_text, X_test_text, y_train, y_test = train_test_split(
        df["processed_text"],
        df["encoded_label"],
        test_size=0.20,
        random_state=random_state,
        stratify=df["encoded_label"],
    )

    vectorizer = TfidfVectorizer(max_features=5000)
    X_train_sparse = vectorizer.fit_transform(X_train_text)
    X_test_sparse = vectorizer.transform(X_test_text)

    X_train = torch.tensor(X_train_sparse.toarray(), dtype=torch.float32)
    X_test = torch.tensor(X_test_sparse.toarray(), dtype=torch.float32)
    y_train_tensor = torch.tensor(y_train.to_numpy(), dtype=torch.long)
    y_test_tensor = torch.tensor(y_test.to_numpy(), dtype=torch.long)

    input_size = X_train.shape[1]
    model = ClaimClassificationModel(input_size=input_size, num_classes=2).to(DEVICE)
    loss_function = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

    epochs = 20
    print("\nStarting training...")
    for epoch in range(epochs):
        model.train()
        logits = model(X_train)
        loss = loss_function(logits, y_train_tensor)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        if (epoch + 1) % 5 == 0:
            print(f"Epoch [{epoch + 1}/{epochs}] Loss: {loss.item():.4f}")

    model.eval()
    with torch.no_grad():
        test_logits = model(X_test)
        predictions = torch.argmax(test_logits, dim=1)

    y_true = y_test_tensor.numpy()
    y_pred = predictions.numpy()
    accuracy = accuracy_score(y_true, y_pred)
    report = classification_report(
        y_true,
        y_pred,
        target_names=label_encoder.classes_,
        output_dict=True,
        zero_division=0,
    )
    matrix = confusion_matrix(y_true, y_pred).tolist()
    macro_metrics = report["macro avg"]

    print("\nAccuracy:", round(float(accuracy), 4))
    print("\nClassification Report:")
    print(classification_report(y_true, y_pred, target_names=label_encoder.classes_, zero_division=0))

    torch.save(
        {
            "model_state_dict": model.state_dict(),
            "input_size": input_size,
            "num_classes": 2,
        },
        MODEL_PATH,
    )
    joblib.dump(vectorizer, VECTORIZER_PATH)
    joblib.dump(label_encoder, LABEL_ENCODER_PATH)

    metrics = {
        "model": "binary_claim_classifier",
        "model_class": "ClaimClassificationModel",
        "classification_type": "binary claim classification (TRUE/FALSE)",
        "training_rows": len(df),
        "test_rows": len(X_test_text),
        "accuracy": float(accuracy),
        "precision": float(macro_metrics["precision"]),
        "recall": float(macro_metrics["recall"]),
        "f1": float(macro_metrics["f1-score"]),
        "classes": label_encoder.classes_.tolist(),
        "tfidf_features": int(input_size),
        "epochs": epochs,
        "report": report,
        "confusion_matrix": {
            "labels": label_encoder.classes_.tolist(),
            "values": matrix,
        },
        "dataset_path": str(DATASET_PATH),
    }
    METRICS_PATH.write_text(json.dumps(metrics, indent=4), encoding="utf-8")

    print("\nModel saved to:", MODEL_PATH)
    print("Vectorizer saved to:", VECTORIZER_PATH)
    print("Label encoder saved to:", LABEL_ENCODER_PATH)
    print("Metrics saved to:", METRICS_PATH)

    return metrics


def load_bundle():
    required_files = [MODEL_PATH, VECTORIZER_PATH, LABEL_ENCODER_PATH]
    for path in required_files:
        if not path.exists():
            raise FileNotFoundError(
                "Binary model files are missing. Run: python setup_ml.py\n"
                f"Missing file: {path}"
            )

    vectorizer = joblib.load(VECTORIZER_PATH)
    label_encoder = joblib.load(LABEL_ENCODER_PATH)
    checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)

    classes = set(label_encoder.classes_.tolist())
    if classes != EXPECTED_LABELS:
        raise ValueError(
            "Loaded label encoder is not binary TRUE/FALSE. "
            f"Classes: {sorted(classes)}"
        )

    tfidf_features = len(vectorizer.get_feature_names_out())
    if int(checkpoint["input_size"]) != int(tfidf_features):
        raise ValueError(
            "Model/vectorizer feature mismatch detected. "
            f"Model expects {checkpoint['input_size']} features, "
            f"vectorizer provides {tfidf_features}."
        )

    model = ClaimClassificationModel(
        input_size=int(checkpoint["input_size"]),
        num_classes=int(checkpoint["num_classes"]),
    )
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(DEVICE)
    model.eval()

    return {
        "model": model,
        "vectorizer": vectorizer,
        "label_encoder": label_encoder,
    }


def analyze(text: str, bundle: Dict):
    text = str(text or "").strip()
    if len(text) < 5:
        raise ValueError("Please provide at least 5 characters.")

    processed_text = preprocess_text(text)
    vectorizer = bundle["vectorizer"]
    vector = vectorizer.transform([processed_text])
    tensor = torch.tensor(vector.toarray(), dtype=torch.float32).to(DEVICE)

    model = bundle["model"]
    label_encoder = bundle["label_encoder"]

    model.eval()
    with torch.no_grad():
        logits = model(tensor)
        probabilities = torch.softmax(logits, dim=1)
        predicted_index = torch.argmax(probabilities, dim=1).item()
        confidence = float(probabilities[0, predicted_index].item())

    prediction = str(label_encoder.inverse_transform([predicted_index])[0]).upper()
    if prediction not in EXPECTED_LABELS:
        raise ValueError(f"Unexpected prediction label from model: {prediction}")

    class_probabilities = {}
    for idx, cls in enumerate(label_encoder.classes_):
        class_probabilities[str(cls).upper()] = round(float(probabilities[0, idx].item()), 6)

    return {
        "prediction": prediction,
        "confidence": round(confidence * 100, 2),
        "model": "binary_claim_classifier",
        "model_file": MODEL_PATH.name,
        "classification_type": "binary claim classification (TRUE/FALSE)",
        "class_probabilities": class_probabilities,
        "tfidf_features": int(vector.shape[1]),
        "processed_text": processed_text,
        "message": (
            "Confidence is the model's probability estimate, not absolute factual certainty."
        ),
    }


if __name__ == "__main__":
    train_model()
