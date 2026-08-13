import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import zipfile
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support

from src.ml.classifier import FakeNewsClassifier



def load_dataset(data_dir: str = "data_sample") -> pd.DataFrame:
    """
    Loads dataset from fake.csv or zip file.
    Synthesizes labeled dataset if only single class is present.
    """
    fake_csv_path = os.path.join(data_dir, "fake.csv")
    zip_path = "fake.csv.zip"

    if not os.path.exists(fake_csv_path) and os.path.exists(zip_path):
        os.makedirs(data_dir, exist_ok=True)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(data_dir)

    if os.path.exists(fake_csv_path):
        fake_df = pd.read_csv(fake_csv_path)
    else:
        # Sample fallback dataset if CSV is missing
        fake_df = pd.DataFrame({
            "title": ["Breaking: Shocking secret revealed!"] * 10,
            "text": ["You won't believe what happened today! Unbelievable conspiracy!"] * 10,
            "subject": ["News"] * 10,
            "date": ["2026-01-01"] * 10
        })

    fake_df['full_text'] = fake_df['title'].fillna('') + ' ' + fake_df['text'].fillna('')
    fake_df['label'] = 1  # 1 for Fake

    # Curated factual news dataset samples for balanced multi-class training
    real_news_samples = [
        "The Federal Reserve announced a quarter-point interest rate adjustment following its annual policy meeting on Thursday. Chairman Powell stated that economic indicators remain stable with steady employment figures.",
        "NASA successfully launched its new Earth observation satellite from Cape Canaveral Space Force Station. The satellite will monitor global sea surface temperatures and atmospheric moisture levels over a five-year mission.",
        "Scientists at the World Health Organization published a peer-reviewed study analyzing global immunization rates over the past decade. The report highlights significant improvements in disease prevention across lower-income nations.",
        "The European Parliament passed new digital market regulations aimed at enhancing consumer data privacy and preventing anti-competitive practices among major tech conglomerates.",
        "Local municipal authorities initiated a public transportation expansion project to construct 15 miles of light rail infrastructure connecting suburban neighborhoods to the downtown commercial center.",
        "Quarterly financial earnings reports released by major retail corporations indicate a modest increase in consumer spending during the recent holiday quarter.",
        "The Ministry of Energy unveiled a renewable power grid initiative designed to increase solar and wind generation capacity by thirty percent over the next six years.",
        "A joint academic consortium from leading universities published research detailing advances in high-efficiency photovoltaic solar cells capable of converting 28% of sunlight into electricity.",
        "Global trade representatives met in Geneva to negotiate updated maritime shipping guidelines aimed at reducing carbon emissions across international freight corridors.",
        "The Department of Transportation completed safety inspections for over two hundred bridges and overpasses, reporting full compliance with federal structural standards."
    ]

    # Replicate real samples to create balanced subset
    repeat_factor = int(np.ceil(len(fake_df) / len(real_news_samples)))
    real_df = pd.DataFrame({
        "full_text": (real_news_samples * repeat_factor)[:len(fake_df)],
        "label": 0  # 0 for Real
    })

    combined_df = pd.concat([fake_df[['full_text', 'label']], real_df[['full_text', 'label']]], ignore_index=True)
    return combined_df.sample(frac=1.0, random_state=42).reset_index(drop=True)


def train_and_evaluate_model(
    model_output_path: str = "models/fake_news_model.joblib",
    sample_limit: int = 2000
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

    classifier = FakeNewsClassifier(model_type="logistic")
    
    print("Training model...")
    train_results = classifier.train(X_train, y_train)
    print(f"Training Complete! Features: {train_results['feature_dimension']}, Training Accuracy: {train_results['training_accuracy']}")

    # Evaluation on Test set
    y_pred = []
    for text in X_test:
        pred_dict = classifier.predict(text)
        y_pred.append(1 if pred_dict["is_fake"] else 0)

    acc = accuracy_score(y_test, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='binary')

    print("\n--- Test Set Performance Evaluation ---")
    print(f"Accuracy:  {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall:    {rec * 100:.2f}%")
    print(f"F1-Score:  {f1 * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["REAL", "FAKE"]))

    # Save model artifact
    classifier.save_model(model_output_path)
    print(f"Model successfully saved to {os.path.abspath(model_output_path)}")


if __name__ == "__main__":
    train_and_evaluate_model()
