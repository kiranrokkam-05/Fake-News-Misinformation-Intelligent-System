"""
PyTorch NLP Classification Pipeline

Dataset:
    data_sample/fake.csv

Columns:
    title
    text
    subject
    date

Input:
    title + text

Target:
    subject

Model:
    TF-IDF
        ↓
    PyTorch Neural Network
        ↓
    Multi-class subject classification
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Dict, List

import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn as nn

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer


# ============================================================
# 1. PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = BASE_DIR / "data_sample" / "fake.csv"

MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)

MODEL_PATH = MODEL_DIR / "pytorch_news_model.pt"

VECTORIZER_PATH = MODEL_DIR / "pytorch_tfidf.joblib"

LABEL_ENCODER_PATH = MODEL_DIR / "pytorch_label_encoder.joblib"

METRICS_PATH = MODEL_DIR / "pytorch_model_metrics.json"


# ============================================================
# 2. DEVICE
# ============================================================

DEVICE = torch.device("cpu")


# ============================================================
# 3. NLTK
# ============================================================

try:

    STOP_WORDS = set(
        stopwords.words("english")
    )

except LookupError:

    import nltk

    nltk.download("stopwords")

    STOP_WORDS = set(
        stopwords.words("english")
    )


try:

    LEMMATIZER = WordNetLemmatizer()

    # Force WordNet lookup so missing data is detected here.
    LEMMATIZER.lemmatize("test")

except LookupError:

    import nltk

    nltk.download("wordnet")

    LEMMATIZER = WordNetLemmatizer()


# ============================================================
# 4. TEXT PREPROCESSING
# ============================================================

def preprocess_text(text: str) -> str:

    # Convert to string
    text = str(text or "")

    # Lowercase
    text = text.lower()

    # Remove URLs
    text = re.sub(
        r"http\S+|www\S+",
        "",
        text
    )

    # Keep only alphabets and spaces
    text = re.sub(
        r"[^a-zA-Z\s]",
        "",
        text
    )

    # Tokenization
    tokens = text.split()

    # Stopword removal + lemmatization
    tokens = [
        LEMMATIZER.lemmatize(word)
        for word in tokens
        if word not in STOP_WORDS
    ]

    return " ".join(tokens)


# ============================================================
# 5. PYTORCH MODEL
# ============================================================

class NewsClassificationModel(nn.Module):

    def __init__(
        self,
        input_size: int,
        num_classes: int
    ):

        super().__init__()

        self.network = nn.Sequential(

            nn.Linear(
                input_size,
                128
            ),

            nn.ReLU(),

            nn.Linear(
                128,
                64
            ),

            nn.ReLU(),

            nn.Linear(
                64,
                num_classes
            )

        )

    def forward(self, x):

        return self.network(x)


# ============================================================
# 6. LOAD DATASET
# ============================================================

def load_dataset():

    if not DATASET_PATH.exists():

        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    df = pd.read_csv(
        DATASET_PATH
    )

    required_columns = {
        "title",
        "text",
        "subject"
    }

    missing = required_columns - set(
        df.columns
    )

    if missing:

        raise ValueError(
            f"Dataset is missing columns: {missing}"
        )

    # Keep only required columns
    df = df[
        [
            "title",
            "text",
            "subject"
        ]
    ].dropna()

    # Combine title + article text
    df["content"] = (

        df["title"].astype(str)

        + " "

        + df["text"].astype(str)

    )

    # Remove empty content
    df = df[
        df["content"].str.strip().str.len() > 10
    ]

    # Clean labels
    df["subject"] = (
        df["subject"]
        .astype(str)
        .str.strip()
    )

    return df


# ============================================================
# 7. TRAIN MODEL
# ============================================================

def train_models(
    dataset_path: str | None = None,
    random_state: int = 42
):
    """Compatibility wrapper used by the project setup script.

    The project historically exposed a `train_models` entrypoint, while the
    backend implementation actually defines `train_model`. This wrapper keeps
    both names working and allows callers to pass an optional dataset path.
    """
    if dataset_path is not None:
        global DATASET_PATH
        DATASET_PATH = Path(dataset_path)
    return train_model(random_state=random_state)


def train_model(
    random_state: int = 42
):

    print("\n" + "=" * 60)
    print("TRAINING PYTORCH NEWS CLASSIFICATION MODEL")
    print("=" * 60)

    # --------------------------------------------------------
    # Load dataset
    # --------------------------------------------------------

    df = load_dataset()

    print(
        f"\nDataset rows: {len(df)}"
    )

    print(
        "\nClasses:"
    )

    print(
        df["subject"].value_counts()
    )

    # --------------------------------------------------------
    # Preprocess
    # --------------------------------------------------------

    print(
        "\nPreprocessing text..."
    )

    df["processed_text"] = (
        df["content"]
        .apply(preprocess_text)
    )

    # --------------------------------------------------------
    # Encode labels
    # --------------------------------------------------------

    label_encoder = LabelEncoder()

    df["label"] = (
        label_encoder
        .fit_transform(df["subject"])
    )

    print(
        "\nLabel Mapping:"
    )

    for index, category in enumerate(
        label_encoder.classes_
    ):

        print(
            f"{index} -> {category}"
        )

    # --------------------------------------------------------
    # Train/test split
    # --------------------------------------------------------

    X_train_text, X_test_text, y_train, y_test = (
        train_test_split(

            df["processed_text"],

            df["label"],

            test_size=0.20,

            random_state=random_state,

            stratify=df["label"]

        )
    )

    # --------------------------------------------------------
    # TF-IDF
    # --------------------------------------------------------

    print(
        "\nCreating TF-IDF features..."
    )

    vectorizer = TfidfVectorizer(

        max_features=5000

    )

    X_train_sparse = (
        vectorizer.fit_transform(
            X_train_text
        )
    )

    X_test_sparse = (
        vectorizer.transform(
            X_test_text
        )
    )

    print(
        f"TF-IDF features: {X_train_sparse.shape[1]}"
    )

    # --------------------------------------------------------
    # Convert to tensors
    # --------------------------------------------------------

    X_train = torch.tensor(

        X_train_sparse.toarray(),

        dtype=torch.float32

    )

    X_test = torch.tensor(

        X_test_sparse.toarray(),

        dtype=torch.float32

    )

    y_train_tensor = torch.tensor(

        y_train.to_numpy(),

        dtype=torch.long

    )

    y_test_tensor = torch.tensor(

        y_test.to_numpy(),

        dtype=torch.long

    )

    # --------------------------------------------------------
    # Model
    # --------------------------------------------------------

    input_size = X_train.shape[1]

    num_classes = len(
        label_encoder.classes_
    )

    model = NewsClassificationModel(

        input_size=input_size,

        num_classes=num_classes

    )

    model.to(DEVICE)

    # --------------------------------------------------------
    # Loss
    # --------------------------------------------------------

    loss_function = nn.CrossEntropyLoss()

    # --------------------------------------------------------
    # Optimizer
    # --------------------------------------------------------

    optimizer = torch.optim.Adam(

        model.parameters(),

        lr=0.001

    )

    # --------------------------------------------------------
    # Training
    # --------------------------------------------------------

    epochs = 20

    print(
        "\nStarting training..."
    )

    for epoch in range(epochs):

        model.train()

        outputs = model(
            X_train
        )

        loss = loss_function(

            outputs,

            y_train_tensor

        )

        optimizer.zero_grad()

        loss.backward()

        optimizer.step()

        if (epoch + 1) % 5 == 0:

            print(

                f"Epoch [{epoch + 1}/{epochs}] "
                f"Loss: {loss.item():.4f}"

            )

    # --------------------------------------------------------
    # Evaluation
    # --------------------------------------------------------

    model.eval()

    with torch.no_grad():

        outputs = model(
            X_test
        )

        predictions = torch.argmax(

            outputs,

            dim=1

        )

    y_true = y_test_tensor.numpy()

    y_pred = predictions.numpy()

    accuracy = accuracy_score(
        y_true,
        y_pred
    )

    report = classification_report(

        y_true,

        y_pred,

        target_names=label_encoder.classes_,

        output_dict=True,

        zero_division=0

    )

    print(
        "\nAccuracy:",
        round(accuracy, 4)
    )

    print(
        "\nClassification Report:"
    )

    print(

        classification_report(

            y_true,

            y_pred,

            target_names=label_encoder.classes_,

            zero_division=0

        )

    )

    # --------------------------------------------------------
    # Save PyTorch model
    # --------------------------------------------------------

    torch.save(

        {
            "model_state_dict":
                model.state_dict(),

            "input_size":
                input_size,

            "num_classes":
                num_classes

        },

        MODEL_PATH

    )

    # Save TF-IDF
    joblib.dump(

        vectorizer,

        VECTORIZER_PATH

    )

    # Save label encoder
    joblib.dump(

        label_encoder,

        LABEL_ENCODER_PATH

    )

    # --------------------------------------------------------
    # Save metrics
    # --------------------------------------------------------

    metrics = {

        "model":
            "PyTorch NewsClassificationModel",

        "training_rows":
            len(df),

        "test_rows":
            len(X_test_text),

        "accuracy":
            float(accuracy),

        "classes":
            label_encoder.classes_.tolist(),

        "tfidf_features":
            input_size,

        "epochs":
            epochs

    }

    METRICS_PATH.write_text(

        json.dumps(
            metrics,
            indent=4
        ),

        encoding="utf-8"

    )

    print(
        "\nModel saved to:"
    )

    print(
        MODEL_PATH
    )

    print(
        "\nTraining completed successfully."
    )

    return metrics


# ============================================================
# 8. LOAD TRAINED MODEL
# ============================================================

def load_bundle():

    required_files = [

        MODEL_PATH,

        VECTORIZER_PATH,

        LABEL_ENCODER_PATH

    ]

    for path in required_files:

        if not path.exists():

            raise FileNotFoundError(

                f"PyTorch model files are missing. "
                f"Run: python -m backend.nlp_pipeline\n"
                f"Missing file: {path}"

            )

    # Load vectorizer
    vectorizer = joblib.load(
        VECTORIZER_PATH
    )

    # Load label encoder
    label_encoder = joblib.load(
        LABEL_ENCODER_PATH
    )

    # Load PyTorch checkpoint
    checkpoint = torch.load(

        MODEL_PATH,

        map_location=DEVICE

    )

    model = NewsClassificationModel(

        input_size=checkpoint["input_size"],

        num_classes=checkpoint["num_classes"]

    )

    model.load_state_dict(

        checkpoint["model_state_dict"]

    )

    model.to(DEVICE)

    model.eval()

    return {

        "model":
            model,

        "vectorizer":
            vectorizer,

        "label_encoder":
            label_encoder

    }


# ============================================================
# 9. ANALYZE NEW TEXT
# ============================================================

def analyze(
    text: str,
    bundle: Dict
):

    text = str(text or "").strip()

    if len(text) < 5:

        raise ValueError(
            "Please provide at least 5 characters."
        )

    # --------------------------------------------------------
    # Preprocess exactly as training
    # --------------------------------------------------------

    processed_text = preprocess_text(
        text
    )

    # --------------------------------------------------------
    # TF-IDF
    # --------------------------------------------------------

    vectorizer = bundle["vectorizer"]

    vector = vectorizer.transform(
        [processed_text]
    )

    # --------------------------------------------------------
    # PyTorch tensor
    # --------------------------------------------------------

    tensor = torch.tensor(

        vector.toarray(),

        dtype=torch.float32

    ).to(DEVICE)

    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    model = bundle["model"]

    label_encoder = bundle["label_encoder"]

    model.eval()

    with torch.no_grad():

        outputs = model(
            tensor
        )

        probabilities = torch.softmax(

            outputs,

            dim=1

        )

        predicted_index = torch.argmax(

            probabilities,

            dim=1

        ).item()

        confidence = probabilities[

            0,

            predicted_index

        ].item()

    # --------------------------------------------------------
    # Convert number back to subject
    # --------------------------------------------------------

    prediction = label_encoder.inverse_transform(

        [predicted_index]

    )[0]

    # --------------------------------------------------------
    # Probability of every class
    # --------------------------------------------------------

    class_probabilities = {}

    for index, category in enumerate(

        label_encoder.classes_

    ):

        class_probabilities[category] = round(

            float(
                probabilities[0, index].item()
            ),

            6

        )

    # --------------------------------------------------------
    # Return ONLY information generated by this pipeline
    # --------------------------------------------------------

    return {

        "prediction":
            prediction,

        "confidence":
            round(
                confidence * 100,
                2
            ),

        "model":
            "PyTorch NewsClassificationModel",

        "classification_type":
            "multi-class subject classification",

        "class_probabilities":
            class_probabilities,

        "tfidf_features":
            int(vector.shape[1]),

        "processed_text":
            processed_text

    }


# ============================================================
# 10. COMMAND-LINE TRAINING
# ============================================================

if __name__ == "__main__":

    train_model()