import os
import re
import joblib
import numpy as np

from typing import List, Dict, Any, Tuple, Optional
from scipy.sparse import hstack, csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer

from sklearn.linear_model import LogisticRegression, PassiveAggressiveClassifier
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.base import BaseEstimator, TransformerMixin

from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nlp.preprocessor import TextPreprocessor


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

    def __init__(self, model_type: str = "linear_svc"):
        self.model_type = model_type
        self.preprocessor = TextPreprocessor()
        
        # Pipeline components
        self.tfidf = TfidfVectorizer(
            max_features=60000,
            min_df=1,
            max_df=0.98,
            ngram_range=(1, 2),
            sublinear_tf=True,
            strip_accents="unicode",
        )
        self.char_tfidf = (
            TfidfVectorizer(
                analyzer="char_wb",
                ngram_range=(3, 5),
                max_features=80000,
                min_df=1,
                sublinear_tf=True,
                strip_accents="unicode",
            )
            if model_type == "linear_svc"
            else None
        )
        self.linguistic_extractor = LinguisticFeatureExtractor()

        if model_type == "linear_svc":
            self.model = LinearSVC(C=10.0, random_state=42)
        elif model_type == "logistic":
            self.model = LogisticRegression(C=0.25, max_iter=1000, class_weight="balanced", random_state=42)
        elif model_type == "random_forest":
            self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        elif model_type == "passive_aggressive":
            self.model = PassiveAggressiveClassifier(max_iter=1000, random_state=42)
        else:
            self.model = LogisticRegression(C=0.25, max_iter=1000, class_weight="balanced", random_state=42)

        self.is_trained = False

    def _prepare_features(self, texts: List[str], fit: bool = False):
        """Extracts combined TF-IDF and linguistic feature matrix."""

        cleaned_texts = [self.preprocessor.clean_text(t) for t in texts]
        
        if fit:
            # Tiny demo/training sets cannot support corpus-frequency cutoffs.
            min_df = 2 if len(cleaned_texts) >= 20 else 1
            self.tfidf.set_params(
                min_df=min_df,
                max_df=0.98 if len(cleaned_texts) >= 20 else 1.0,
            )
            tfidf_features = self.tfidf.fit_transform(cleaned_texts)
            if self.char_tfidf is not None:
                self.char_tfidf.set_params(min_df=min_df)
                char_features = self.char_tfidf.fit_transform(cleaned_texts)
            else:
                char_features = None
        else:
            tfidf_features = self.tfidf.transform(cleaned_texts)
            char_features = self.char_tfidf.transform(cleaned_texts) if self.char_tfidf is not None else None

        if char_features is not None:
            return hstack([tfidf_features, char_features]).tocsr()

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

    def _score_text(self, text: str) -> Dict[str, Any]:
        """Calculate both legacy class scores and the raw margin in one pass."""
        if not self.is_trained:
            ling_vec = self.linguistic_extractor._extract_single_features(text)
            caps_ratio, exclamation_ratio = ling_vec[0], ling_vec[1]
            fake_score = min(0.95, max(0.05, 0.5 + (caps_ratio * 2.0) + (exclamation_ratio * 3.0)))
            return {"real_score": round(1.0 - fake_score, 4), "fake_score": round(fake_score, 4), "decision_margin": None, "score_kind": "untrained_linguistic_heuristic"}

        X_mat = self._prepare_features([text], fit=False)
        decision = None
        if hasattr(self.model, "decision_function"):
            decision = float(np.asarray(self.model.decision_function(X_mat)).reshape(-1)[0])
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(X_mat)[0]
            class_indices = {int(label): idx for idx, label in enumerate(self.model.classes_)}
            real_score = float(probs[class_indices[0]])
            fake_score = float(probs[class_indices[1]])
            score_kind = "uncalibrated_model_score"
        elif decision is not None:
            # Compatibility score only. Sigmoid(decision_function) is not
            # probability calibration and must never be called confidence.
            fake_score = float(1.0 / (1.0 + np.exp(-np.clip(decision, -30, 30))))
            real_score = 1.0 - fake_score
            score_kind = "uncalibrated_sigmoid_of_svm_margin"
        else:
            predicted = int(self.model.predict(X_mat)[0])
            fake_score, real_score = float(predicted == 1), float(predicted == 0)
            score_kind = "uncalibrated_hard_class_score"

        return {
            "real_score": round(real_score, 4),
            "fake_score": round(fake_score, 4),
            "decision_margin": decision,
            "score_kind": score_kind,
        }

    def predict_proba(self, text: str) -> Dict[str, float]:
        """
        Return legacy score fields for API compatibility.

        LinearSVC has no predict_proba method. Its decision margin is mapped
        through a sigmoid only as a bounded display score; this is NOT a
        calibrated probability. Callers must check the metadata returned by
        predict() and must not treat this score as factual confidence.
        """
        scores = self._score_text(text)

        return {
            "real_probability": scores["real_score"],
            "fake_probability": scores["fake_score"],
        }

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Classify by the SVM decision margin and expose score semantics.

        LinearSVC's hinge-loss margin is used as an abstention band: only
        margins beyond +/-1 are decisive. The interval around the boundary
        is explicitly uncertain. This avoids turning a sigmoid of the raw
        SVM margin into apparent probability certainty.
        """
        scores = self._score_text(text)
        fake_p = scores["fake_score"]
        decision_margin = scores["decision_margin"]

        if decision_margin is not None and decision_margin >= 1.0:
            verdict = "FAKE"
        elif decision_margin is not None and decision_margin <= -1.0:
            verdict = "REAL"
        else:
            verdict = "SUSPICIOUS / UNCERTAIN"

        return {
            "verdict": verdict,
            # Kept for compatibility. These are scores, not calibrated
            # probabilities; new consumers should use fake_score and margin.
            "fake_probability": fake_p,
            "real_probability": scores["real_score"],
            "fake_score": fake_p,
            "real_score": scores["real_score"],
            "score_kind": scores["score_kind"],
            "probability_calibrated": False,
            "decision_margin": decision_margin,
            "margin_threshold": 1.0,
            "is_fake": True if verdict == "FAKE" else False if verdict == "REAL" else None,
        }

    def save_model(self, filepath: str) -> None:
        """Saves trained model state to file using joblib."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        data = {
            "tfidf": self.tfidf,
            "char_tfidf": self.char_tfidf,
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
        self.char_tfidf = data.get("char_tfidf")
        self.model = data["model"]
        self.model_type = data.get("model_type", "logistic")
        self.is_trained = data.get("is_trained", True)
