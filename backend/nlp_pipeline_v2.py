"""FEVER-based binary claim classification pipeline.

The source files are FEVER-derived claim records from the public
RUC-NLPIR/FlashRAG_datasets repository. Only SUPPORTS and REFUTES are
accepted; NOT ENOUGH INFO and any other labels are excluded.
"""

from __future__ import annotations

import json
import re
import copy
from pathlib import Path
from typing import Dict, Iterable

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
DATA_DIR = BASE_DIR / "data" / "fever"
TRAIN_DATA_PATH = DATA_DIR / "train.jsonl"
TEST_DATA_PATH = DATA_DIR / "dev.jsonl"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)

MODEL_PATH = MODEL_DIR / "pytorch_claim_binary_v2_model.pt"
VECTORIZER_PATH = MODEL_DIR / "pytorch_claim_binary_v2_tfidf.joblib"
LABEL_ENCODER_PATH = MODEL_DIR / "pytorch_claim_binary_v2_label_encoder.joblib"
METRICS_PATH = MODEL_DIR / "pytorch_claim_binary_v2_metrics.json"

DEVICE = torch.device("cpu")
EXPECTED_LABELS = {"FALSE", "TRUE"}
SOURCE_LABELS = {"SUPPORTS", "REFUTES"}
LABEL_MAPPING = {"SUPPORTS": "TRUE", "REFUTES": "FALSE"}
EXCLUDED_LABELS = {"NOT ENOUGH INFO"}
SOURCE_URL = (
    "https://huggingface.co/datasets/RUC-NLPIR/FlashRAG_datasets/"
    "tree/main/fever"
)

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


class ClaimClassificationModelV2(nn.Module):
    def __init__(self, input_size: int, num_classes: int = 2, dropout: bool = True):
        super().__init__()
        layers = [nn.Linear(input_size, 128), nn.ReLU()]
        if dropout:
            layers.append(nn.Dropout(p=0.35))
        layers.extend([nn.Linear(128, 64), nn.ReLU()])
        if dropout:
            layers.append(nn.Dropout(p=0.25))
        layers.append(nn.Linear(64, num_classes))
        self.network = nn.Sequential(*layers)

    def forward(self, features):
        return self.network(features)


def preprocess_text(text: str) -> str:
    """Normalize claims while preserving numeric tokens and decimal values."""
    text = str(text or "").lower()
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    tokens = re.findall(r"[a-z]+(?:'[a-z]+)?|\d+(?:\.\d+)?", text)
    normalized = []
    for token in tokens:
        if token.replace(".", "", 1).isdigit():
            normalized.append(token)
        elif token not in STOP_WORDS:
            normalized.append(LEMMATIZER.lemmatize(token))
    return " ".join(normalized)


def _read_jsonl(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"FEVER data file not found: {path}")
    rows = []
    with path.open(encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            record = json.loads(line)
            claim = record.get("question")
            raw_answers = record.get("golden_answers", [])
            labels = {str(value).strip().upper() for value in raw_answers}
            if not claim or not labels:
                continue
            source_label = next(iter(labels)) if len(labels) == 1 else "AMBIGUOUS"
            rows.append({"claim": str(claim).strip(), "source_label": source_label})
    if not rows:
        raise ValueError(f"No usable FEVER records found in {path}")
    return pd.DataFrame(rows)


def load_claim_data() -> tuple[pd.DataFrame, pd.DataFrame, Dict[str, int]]:
    train_raw = _read_jsonl(TRAIN_DATA_PATH)
    test_raw = _read_jsonl(TEST_DATA_PATH)
    excluded = {
        "NOT ENOUGH INFO": 0,
        "unsupported_or_ambiguous": 0,
        "duplicate_claims": 0,
    }

    def clean(frame: pd.DataFrame) -> pd.DataFrame:
        before = len(frame)
        frame = frame.drop_duplicates(subset=["claim"], keep="first").copy()
        excluded["duplicate_claims"] += before - len(frame)
        excluded["NOT ENOUGH INFO"] += int((frame["source_label"] == "NOT ENOUGH INFO").sum())
        excluded["unsupported_or_ambiguous"] += int(
            (~frame["source_label"].isin(SOURCE_LABELS | EXCLUDED_LABELS)).sum()
        )
        frame["label"] = frame["source_label"].map(LABEL_MAPPING)
        frame = frame.dropna(subset=["label"])
        frame["claim"] = frame["claim"].str.strip()
        return frame[frame["claim"].str.len() >= 10].reset_index(drop=True)

    train = clean(train_raw)
    test = clean(test_raw)
    if set(train["label"]) != EXPECTED_LABELS or set(test["label"]) != EXPECTED_LABELS:
        raise ValueError("FEVER data must contain both SUPPORTS/REFUTES classes in each split.")
    return train, test, excluded


def _batch_features(matrix, start: int, end: int) -> torch.Tensor:
    return torch.tensor(matrix[start:end].toarray(), dtype=torch.float32)


def train_model(random_state: int = 42):
    np.random.seed(random_state)
    torch.manual_seed(random_state)
    train_frame, test_frame, excluded = load_claim_data()

    train_text, validation_text, train_labels, validation_labels = train_test_split(
        train_frame["claim"],
        train_frame["label"],
        test_size=0.15,
        random_state=random_state,
        stratify=train_frame["label"],
    )
    encoder = LabelEncoder()
    encoder.fit(["FALSE", "TRUE"])
    y_train = encoder.transform(train_labels)
    y_validation = encoder.transform(validation_labels)
    y_test = encoder.transform(test_frame["label"])

    processed_train = train_text.map(preprocess_text)
    processed_validation = validation_text.map(preprocess_text)
    processed_test = test_frame["claim"].map(preprocess_text)
    vectorizer = TfidfVectorizer(
        max_features=5000,
        token_pattern=r"(?u)\b\w+(?:\.\w+)*\b",
        ngram_range=(1, 2),
    )
    x_train = vectorizer.fit_transform(processed_train)
    x_validation = vectorizer.transform(processed_validation)
    x_test = vectorizer.transform(processed_test)

    model = ClaimClassificationModelV2(input_size=x_train.shape[1]).to(DEVICE)
    optimizer = torch.optim.AdamW(model.parameters(), lr=0.001, weight_decay=0.01)
    class_counts = np.bincount(y_train, minlength=2).astype(np.float32)
    class_weights = torch.tensor(
        class_counts.sum() / (2.0 * class_counts),
        dtype=torch.float32,
    )
    loss_function = nn.CrossEntropyLoss(weight=class_weights)
    batch_size = 512
    max_epochs = 30
    patience = 4
    best_validation_loss = float("inf")
    best_state = None
    best_epoch = 0
    epochs_trained = 0
    for epoch in range(max_epochs):
        model.train()
        order = np.random.permutation(x_train.shape[0])
        for offset in range(0, len(order), batch_size):
            indexes = order[offset : offset + batch_size]
            logits = model(_batch_features(x_train[indexes], 0, len(indexes)))
            targets = torch.tensor(y_train[indexes], dtype=torch.long)
            loss = loss_function(logits, targets)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        model.eval()
        with torch.no_grad():
            validation_loss = 0.0
            for offset in range(0, x_validation.shape[0], batch_size):
                end = min(offset + batch_size, x_validation.shape[0])
                logits = model(_batch_features(x_validation, offset, end))
                targets = torch.tensor(y_validation[offset:end], dtype=torch.long)
                validation_loss += float(loss_function(logits, targets)) * (end - offset)
            validation_loss /= max(1, x_validation.shape[0])
        epochs_trained = epoch + 1
        if validation_loss < best_validation_loss:
            best_validation_loss = validation_loss
            best_state = copy.deepcopy(model.state_dict())
            best_epoch = epochs_trained
        elif epochs_trained - best_epoch >= patience:
            break

    if best_state is not None:
        model.load_state_dict(best_state)

    def predict(matrix):
        model.eval()
        outputs = []
        with torch.no_grad():
            for offset in range(0, matrix.shape[0], batch_size):
                outputs.append(model(_batch_features(matrix, offset, min(offset + batch_size, matrix.shape[0]))))
        return torch.cat(outputs)

    validation_predictions = torch.argmax(predict(x_validation), dim=1).numpy()
    test_predictions = torch.argmax(predict(x_test), dim=1).numpy()
    report = classification_report(
        y_test,
        test_predictions,
        target_names=encoder.classes_,
        output_dict=True,
        zero_division=0,
    )
    metrics = {
        "model": "binary_claim_classifier_v2",
        "model_class": "ClaimClassificationModelV2",
        "classification_type": "binary claim classification (TRUE/FALSE)",
        "source": "FEVER-derived binary subset",
        "source_url": SOURCE_URL,
        "label_mapping": LABEL_MAPPING,
        "excluded_labels": sorted(EXCLUDED_LABELS),
        "excluded_counts": excluded,
        "total_usable_samples": int(len(train_frame) + len(test_frame)),
        "true_count": int((pd.concat([train_frame, test_frame])["label"] == "TRUE").sum()),
        "false_count": int((pd.concat([train_frame, test_frame])["label"] == "FALSE").sum()),
        "train_rows": int(len(train_text)),
        "validation_rows": int(len(validation_text)),
        "test_rows": int(len(test_frame)),
        "validation_accuracy": float(accuracy_score(y_validation, validation_predictions)),
        "accuracy": float(accuracy_score(y_test, test_predictions)),
        "precision": float(report["macro avg"]["precision"]),
        "recall": float(report["macro avg"]["recall"]),
        "f1": float(report["macro avg"]["f1-score"]),
        "classes": encoder.classes_.tolist(),
        "tfidf_features": int(x_train.shape[1]),
        "vectorizer": {
            "max_features": 5000,
            "ngram_range": [1, 2],
            "token_pattern": r"(?u)\b\w+(?:\.\w+)*\b",
        },
        "preprocessing": "lowercase, URL removal, token normalization, stopword removal, lemmatization; numbers/decimals retained",
        "epochs": epochs_trained,
        "best_epoch": best_epoch,
        "early_stopping_patience": patience,
        "weight_decay": 0.01,
        "dropout": [0.35, 0.25],
        "report": report,
        "confusion_matrix": {
            "labels": encoder.classes_.tolist(),
            "values": confusion_matrix(y_test, test_predictions).tolist(),
        },
    }
    torch.save(
        {"model_state_dict": model.state_dict(), "input_size": x_train.shape[1], "num_classes": 2},
        MODEL_PATH,
    )
    joblib.dump(vectorizer, VECTORIZER_PATH)
    joblib.dump(encoder, LABEL_ENCODER_PATH)
    METRICS_PATH.write_text(json.dumps(metrics, indent=4), encoding="utf-8")
    return metrics


def load_bundle():
    required = [MODEL_PATH, VECTORIZER_PATH, LABEL_ENCODER_PATH]
    for path in required:
        if not path.exists():
            raise FileNotFoundError(f"Missing v2 artifact: {path}")
    vectorizer = joblib.load(VECTORIZER_PATH)
    encoder = joblib.load(LABEL_ENCODER_PATH)
    if encoder.classes_.tolist() != ["FALSE", "TRUE"]:
        raise ValueError(f"Invalid v2 label mapping: {encoder.classes_.tolist()}")
    checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
    if checkpoint["num_classes"] != 2:
        raise ValueError("v2 model does not have exactly two classes.")
    if checkpoint["input_size"] != len(vectorizer.get_feature_names_out()):
        raise ValueError("v2 model/vectorizer feature mismatch.")
    state_dict = checkpoint["model_state_dict"]
    # Older saved v2 weights predate the dropout layers. Their linear layer
    # indices are 0, 2, and 4, while current weights use 0, 3, and 6.
    legacy_no_dropout = "network.2.weight" in state_dict
    model = ClaimClassificationModelV2(
        checkpoint["input_size"], checkpoint["num_classes"], dropout=not legacy_no_dropout
    )
    model.load_state_dict(state_dict)
    model.eval()
    return {"model": model, "vectorizer": vectorizer, "label_encoder": encoder}


def analyze(text: str, bundle: Dict):
    raw_text = str(text or "").strip()
    if len(raw_text) < 5:
        raise ValueError("Please provide at least 5 characters.")
    processed = preprocess_text(raw_text)
    vector = bundle["vectorizer"].transform([processed])
    model = bundle["model"]
    with torch.no_grad():
        logits = model(torch.tensor(vector.toarray(), dtype=torch.float32))
        probabilities = torch.softmax(logits, dim=1)
    predicted_index = int(torch.argmax(probabilities, dim=1).item())
    encoder = bundle["label_encoder"]
    prediction = str(encoder.inverse_transform([predicted_index])[0])
    class_probabilities = {
        str(label): round(float(probabilities[0, index]), 6)
        for index, label in enumerate(encoder.classes_)
    }
    confidence = class_probabilities[prediction]
    return {
        "prediction": prediction,
        "confidence": round(confidence * 100, 2),
        "model": "binary_claim_classifier_v2",
        "model_file": MODEL_PATH.name,
        "classification_type": "binary claim classification (TRUE/FALSE)",
        "class_probabilities": class_probabilities,
        "tfidf_features": int(vector.shape[1]),
        "processed_text": processed,
        "message": "Model confidence is not independent evidence or absolute factual certainty.",
    }
