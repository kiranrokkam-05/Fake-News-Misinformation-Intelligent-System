import unittest
import os
import shutil

from src.nlp.preprocessor import TextPreprocessor
from src.nlp.claim_extractor import ClaimExtractor
from src.nlp.embeddings import SemanticSimilarityEngine
from src.ml.classifier import FakeNewsClassifier
from src.ml.confidence import ConfidenceCalculator
from src.nlp_ml_pipeline import FakeNewsNLPPipeline


class TestNLPMLPipeline(unittest.TestCase):

    def setUp(self):
        self.sample_text = (
            "Breaking: President John Smith announced a new $500 million economic initiative in Washington today! "
            "According to official reports, inflation decreased by 2.5% this quarter. "
            "However, critics claim that UNBELIEVABLE financial chaos is guaranteed to happen!!!"
        )
        self.sample_references = [
            "President John Smith announced an economic package worth $500 million in Washington.",
            "Official economic figures show inflation dropped by 2.5% in recent months."
        ]

    def test_text_preprocessor(self):
        preprocessor = TextPreprocessor()
        cleaned = preprocessor.clean_text("<h1>Hello World!</h1> Check http://test.com")
        self.assertEqual(cleaned, "Hello World! Check")

        sentences = preprocessor.tokenize_sentences(self.sample_text)
        self.assertGreaterEqual(len(sentences), 2)

        tokens = preprocessor.tokenize_words(self.sample_text, remove_stopwords=True, lemmatize=True)
        self.assertIn("president", tokens)

    def test_claim_extractor(self):
        extractor = ClaimExtractor()
        entities = extractor.extract_entities(self.sample_text)
        self.assertTrue(len(entities) > 0)

        claims = extractor.extract_claims(self.sample_text)
        self.assertGreaterEqual(len(claims), 1)
        self.assertIn("claim_type", claims[0].__dict__)

    def test_semantic_similarity_engine(self):
        engine = SemanticSimilarityEngine()
        sim = engine.compute_cosine_similarity("Inflation dropped by 2%", "Inflation decreased by 2%")
        self.assertGreater(sim, 0.15)

        consensus = engine.calculate_consensus_score(["Inflation dropped by 2%"], self.sample_references)
        self.assertGreater(consensus["overall_consensus_score"], 0.1)


    def test_fake_news_classifier(self):
        classifier = FakeNewsClassifier()
        train_texts = [
            "SHOCKING CONSPIRACY REVEALED!!! Secret aliens control everything!",
            "Federal Reserve adjusts benchmark interest rate by 25 basis points."
        ]
        train_labels = [1, 0]

        train_res = classifier.train(train_texts, train_labels)
        self.assertEqual(train_res["training_accuracy"], 1.0)

        pred = classifier.predict("UNBELIEVABLE SHOCKING SECRET CONSPIRACY!!!")
        self.assertIn(pred["verdict"], ["FAKE", "REAL", "SUSPICIOUS / UNCERTAIN"])

    def test_confidence_calculator(self):
        calc = ConfidenceCalculator()
        ml_pred = {"fake_probability": 0.85, "real_probability": 0.15, "verdict": "FAKE", "is_fake": True}
        claims = {"total_claims": 2, "total_entities": 1, "claims": [{"verifiability_score": 0.4}]}
        prep = {"raw_text": "SHOCKING!!!", "word_count": 2}

        conf = calc.calculate_confidence(ml_pred, claims, prep)
        self.assertIn("confidence_percentage", conf)
        self.assertGreaterEqual(conf["confidence_percentage"], 0.0)

    def test_end_to_end_pipeline(self):
        pipeline = FakeNewsNLPPipeline(model_path="models/test_model.joblib")
        result = pipeline.analyze_text(self.sample_text, reference_texts=self.sample_references)

        self.assertIn("classification", result)
        self.assertIn("confidence_assessment", result)
        self.assertIn("claims_and_entities", result)
        self.assertIn("nlp_tokens", result)


if __name__ == "__main__":
    unittest.main()
