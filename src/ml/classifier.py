import os
import re
import joblib
import numpy as np

from typing import List, Dict, Any, Tuple, Optional
from scipy.sparse import hstack, csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer

from sklearn.linear_model import LogisticRegression, PassiveAggressiveClassifier
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.base import BaseEstimator, TransformerMixin

from nltk.sentiment.vader import SentimentIntensityAnalyzer
from ..nlp.preprocessor import TextPreprocessor


class LinguisticFeatureExtractor(BaseEstimator, TransformerMixin):
    """
    Extracts stylistic, sensationalism, and linguistic features from text.
    """

    def __init__(self):
        self.preprocessor = TextPreprocessor()
        self.vader = None
        try:
            self.vader = SentimentIntensityAnalyzer()
        except Exception:
            self.vader = None

    def fit(self, X, y=None):
        return self

    def _extract_single_features(self, text: str) -> np.ndarray:
        if not text or not isinstance(text, str):
            return np.zeros(10)

        cleaned = self.preprocessor.clean_text(text)
        words = cleaned.split()
        word_count = max(1, len(words))

        # 1. Capitalization ratio (sensationalism indicator)
        caps_count = sum(1 for w in words if w.isupper() and len(w) > 1)
        caps_ratio = caps_count / word_count

        # 2. Exclamation mark count
        exclamation_count = text.count('!')
        exclamation_ratio = exclamation_count / word_count

        # 3. Question mark count
        question_count = text.count('?')
        question_ratio = question_count / word_count

        # 4. Quotation mark count
        quote_count = text.count('"') + text.count("'")
        quote_ratio = quote_count / word_count

        # 5. Type-Token Ratio (Lexical Diversity)
        unique_words = len(set(w.lower() for w in words))
        ttr = unique_words / word_count

        # 6. Average word length
        avg_word_len = sum(len(w) for w in words) / word_count

        # 7. Average sentence length
        sentences = self.preprocessor.tokenize_sentences(cleaned)
        avg_sent_len = word_count / max(1, len(sentences))

        # 8-10. Sentiment polarity scores (Compound, Pos, Neg)
        if self.vader:
            try:
                vs = self.vader.polarity_scores(cleaned)
                compound = vs['compound']
                pos = vs['pos']
                neg = vs['neg']
            except Exception:
                compound, pos, neg = 0.0, 0.0, 0.0
        else:
            compound, pos, neg = 0.0, 0.0, 0.0

        return np.array([
            caps_ratio,
            exclamation_ratio,
            question_ratio,
            quote_ratio,
            ttr,
            avg_word_len,
            avg_sent_len,
            compound,
            pos,
            neg
        ])

    def transform(self, X) -> np.ndarray:
        features = [self._extract_single_features(text) for text in X]
        return np.array(features)


class FakeNewsClassifier:
    """
    Hybrid Machine Learning Classifier for Fake News & Misinformation Detection.
    Combines TF-IDF N-grams with custom linguistic/stylistic feature extraction.
    """

    def __init__(self, model_type: str = "logistic"):
        self.model_type = model_type
        self.preprocessor = TextPreprocessor()
        
        # Pipeline components
        self.tfidf = TfidfVectorizer(
            max_features=10000,
            ngram_range=(1, 2),
            sublinear_tf=True,
            stop_words='english'
        )
        self.linguistic_extractor = LinguisticFeatureExtractor()

        if model_type == "logistic":
            self.model = LogisticRegression(C=1.0, max_iter=1000, random_state=42)
        elif model_type == "random_forest":
            self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        elif model_type == "passive_aggressive":
            self.model = PassiveAggressiveClassifier(max_iter=1000, random_state=42)
        else:
            self.model = LogisticRegression(C=1.0, max_iter=1000, random_state=42)

        self.is_trained = False

    def _prepare_features(self, texts: List[str], fit: bool = False):
        """Extracts combined TF-IDF and linguistic feature matrix."""

        cleaned_texts = [self.preprocessor.clean_text(t) for t in texts]
        
        if fit:
            tfidf_features = self.tfidf.fit_transform(cleaned_texts)
        else:
            tfidf_features = self.tfidf.transform(cleaned_texts)

        ling_features = self.linguistic_extractor.transform(cleaned_texts)
        ling_sparse = csr_matrix(ling_features)
        
        return hstack([tfidf_features, ling_sparse])


    def train(self, X_train: List[str], y_train: List[int]) -> Dict[str, Any]:
        """
        Trains the classifier model on text training data and labels (1: FAKE, 0: REAL).
        """
        X_mat = self._prepare_features(X_train, fit=True)
        y_arr = np.array(y_train)

        self.model.fit(X_mat, y_arr)
        self.is_trained = True

        train_acc = float(self.model.score(X_mat, y_arr))

        return {
            "samples_count": len(X_train),
            "feature_dimension": X_mat.shape[1],
            "training_accuracy": round(train_acc, 4),
            "model_type": self.model_type
        }

    def predict_proba(self, text: str) -> Dict[str, float]:
        """
        Predicts class probabilities for input text.
        Returns {"real_probability": float, "fake_probability": float}.
        """
        if not self.is_trained:
            # Heuristic default based on linguistic cues if model is un-trained
            ling_vec = self.linguistic_extractor._extract_single_features(text)
            caps_ratio, exclamation_ratio = ling_vec[0], ling_vec[1]
            fake_prob = min(0.95, max(0.05, 0.5 + (caps_ratio * 2.0) + (exclamation_ratio * 3.0)))
            return {
                "real_probability": round(1.0 - fake_prob, 4),
                "fake_probability": round(fake_prob, 4)
            }

        X_mat = self._prepare_features([text], fit=False)

        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(X_mat)[0]
            real_p, fake_p = float(probs[0]), float(probs[1])
        else:
            decision = self.model.decision_function(X_mat)[0]
            fake_p = float(1.0 / (1.0 + np.exp(-decision)))
            real_p = 1.0 - fake_p

        return {
            "real_probability": round(real_p, 4),
            "fake_probability": round(fake_p, 4)
        }

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Returns classification verdict for text.
        """
        probs = self.predict_proba(text)
        fake_p = probs["fake_probability"]

        if fake_p >= 0.65:
            verdict = "FAKE"
        elif fake_p <= 0.35:
            verdict = "REAL"
        else:
            verdict = "SUSPICIOUS / UNCERTAIN"

        return {
            "verdict": verdict,
            "fake_probability": fake_p,
            "real_probability": probs["real_probability"],
            "is_fake": fake_p > 0.5
        }

    def save_model(self, filepath: str) -> None:
        """Saves trained model state to file using joblib."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        data = {
            "tfidf": self.tfidf,
            "model": self.model,
            "model_type": self.model_type,
            "is_trained": self.is_trained
        }
        joblib.dump(data, filepath)

    def load_model(self, filepath: str) -> None:
        """Loads trained model state from file."""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file not found at {filepath}")

        data = joblib.load(filepath)
        self.tfidf = data["tfidf"]
        self.model = data["model"]
        self.model_type = data.get("model_type", "logistic")
        self.is_trained = data.get("is_trained", True)
