import os
import logging
from typing import List, Dict, Any, Optional

from src.nlp.preprocessor import TextPreprocessor
from src.nlp.claim_extractor import ClaimExtractor
from src.nlp.embeddings import SemanticSimilarityEngine
from src.ml.classifier import FakeNewsClassifier
from src.ml.confidence import ConfidenceCalculator

logger = logging.getLogger(__name__)


class FakeNewsNLPPipeline:
    """
    Unified high-level NLP & ML Pipeline facade for Fake News & Misinformation Analysis.
    Provides complete end-to-end processing: text cleaning, tokenization, NER,
    claim extraction, embeddings, semantic similarity, ML classification, and confidence scoring.
    """

    def __init__(self, model_path: str = "models/fake_news_model.joblib"):
        self.model_path = model_path
        self.preprocessor = TextPreprocessor()
        self.claim_extractor = ClaimExtractor()
        self.similarity_engine = SemanticSimilarityEngine()
        self.classifier = FakeNewsClassifier()
        self.confidence_calculator = ConfidenceCalculator()

        # Load pre-trained model if available
        if os.path.exists(model_path):
            try:
                self.classifier.load_model(model_path)
                logger.info(f"Loaded trained ML model from {model_path}")
            except Exception as e:
                logger.warning(f"Could not load model from {model_path}: {e}")

    def analyze_text(
        self, 
        text: str, 
        reference_texts: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Executes end-to-end NLP & ML analysis on input text.

        Parameters:
            text (str): Input news article, headline, or claim text.
            reference_texts (List[str], optional): Verified fact-checking articles or reference texts.

        Returns:
            Dict[str, Any]: Comprehensive analysis report.
        """
        if not text or not isinstance(text, str):
            return {"error": "Invalid input text. Expected non-empty string."}

        # Step 1: Text Preprocessing & Tokenization
        preprocess_res = self.preprocessor.preprocess_pipeline(text)

        # Step 2: Named Entity Recognition & Claim Extraction
        claims_res = self.claim_extractor.process_text_claims(text)

        # Step 3: Semantic Embeddings & Similarity (if reference texts provided)
        consensus_res = None
        if reference_texts and len(reference_texts) > 0:
            claim_texts = [c["text"] for c in claims_res.get("claims", [])]
            if not claim_texts:
                claim_texts = preprocess_res["sentences"]
            consensus_res = self.similarity_engine.calculate_consensus_score(claim_texts, reference_texts)

        # Step 4: Machine Learning Classification
        ml_res = self.classifier.predict(text)

        # Step 5: Calibrated Multi-Factor Confidence Scoring
        confidence_res = self.confidence_calculator.calculate_confidence(
            ml_prediction=ml_res,
            claims_analysis=claims_res,
            preprocessed_meta=preprocess_res,
            consensus_analysis=consensus_res
        )

        # Step 6: Assemble Comprehensive Output Payload
        return {
            "input_text_summary": {
                "length_characters": len(text),
                "sentence_count": preprocess_res["sentence_count"],
                "word_count": preprocess_res["word_count"],
                "cleaned_preview": preprocess_res["cleaned_text"][:200] + ("..." if len(preprocess_res["cleaned_text"]) > 200 else "")
            },
            "classification": {
                "verdict": ml_res["verdict"],
                "is_fake": ml_res["is_fake"],
                "fake_probability": ml_res["fake_probability"],
                "real_probability": ml_res["real_probability"]
            },
            "confidence_assessment": confidence_res,
            "claims_and_entities": {
                "total_entities": claims_res["total_entities"],
                "entity_summary": claims_res["entity_summary"],
                "extracted_claims_count": claims_res["total_claims"],
                "claims": claims_res["claims"]
            },
            "semantic_consensus": consensus_res,
            "nlp_tokens": {
                "processed_tokens_sample": preprocess_res["processed_tokens"][:20],
                "unique_word_count": preprocess_res["unique_word_count"]
            }
        }
