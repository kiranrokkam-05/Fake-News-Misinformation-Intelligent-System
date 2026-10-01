from typing import List, Dict, Any, Optional


class ConfidenceCalculator:
    """
    Computes calibrated, multi-factor confidence scores for misinformation analysis.
    Integrates ML prediction probability, linguistic metrics, claim verifiability,
    and semantic consensus scores.
    """

    def __init__(self):
        pass

    def calculate_confidence(
        self,
        ml_prediction: Dict[str, Any],
        claims_analysis: Dict[str, Any],
        preprocessed_meta: Dict[str, Any],
        consensus_analysis: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Computes multi-factor confidence score and risk classification.
        """
        fake_prob = ml_prediction.get("fake_probability", 0.5)
        real_prob = ml_prediction.get("real_probability", 0.5)
        is_fake = ml_prediction.get("is_fake", fake_prob > 0.5)

        # 1. Base ML model confidence
        base_ml_conf = max(fake_prob, real_prob)

        # 2. Claim verifiability factor
        total_claims = claims_analysis.get("total_claims", 0)
        total_entities = claims_analysis.get("total_entities", 0)
        
        claims = claims_analysis.get("claims", [])
        avg_verifiability = 0.0
        if claims:
            avg_verifiability = sum(c.get("verifiability_score", 0.0) for c in claims) / len(claims)

        # 3. Linguistic quality & Sensationalism penalties
        raw_text = preprocessed_meta.get("raw_text", "")
        word_count = max(1, preprocessed_meta.get("word_count", len(raw_text.split())))
        
        exclamation_count = raw_text.count('!')
        caps_words = sum(1 for w in raw_text.split() if w.isupper() and len(w) > 1)

        sensationalism_penalty = min(0.3, (exclamation_count * 0.05) + ((caps_words / word_count) * 0.5))

        # 4. Semantic Consensus Factor (if references provided)
        consensus_score = 0.0
        if consensus_analysis:
            consensus_score = consensus_analysis.get("overall_consensus_score", 0.0)

        # 5. Composite Confidence Score Calculation
        # Weighting: 50% ML Model, 20% Verifiability, 15% Linguistic Stability, 15% Consensus
        if is_fake:
            # High sensationalism and low verifiability increase confidence that it is FAKE
            calibrated_score = (fake_prob * 0.50) + (sensationalism_penalty * 0.20) + ((1.0 - avg_verifiability) * 0.15) + ((1.0 - consensus_score) * 0.15)
        else:
            # High verifiability, low sensationalism, and high consensus increase confidence that it is REAL
            calibrated_score = (real_prob * 0.50) + (avg_verifiability * 0.20) + ((1.0 - sensationalism_penalty) * 0.15) + (consensus_score * 0.15)

        final_confidence = round(max(0.0, min(1.0, calibrated_score)), 4)
        confidence_percentage = round(final_confidence * 100, 2)

        # Determine Risk Level Category
        if is_fake:
            if confidence_percentage >= 80.0:
                risk_category = "HIGH_RISK_MISINFORMATION"
            elif confidence_percentage >= 60.0:
                risk_category = "MODERATE_RISK_FAKE"
            else:
                risk_category = "POTENTIALLY_UNRELIABLE"
        else:
            if confidence_percentage >= 80.0:
                risk_category = "HIGH_CONFIDENCE_AUTHENTIC"
            elif confidence_percentage >= 60.0:
                risk_category = "LIKELY_AUTHENTIC"
            else:
                risk_category = "NEUTRAL_UNCERTAIN"

        # Risk Factors & Reassuring Cues
        risk_factors = []
        if fake_prob >= 0.6:
            risk_factors.append("High machine learning classification probability for fake news pattern.")
        if exclamation_count > 2:
            risk_factors.append(f"Excessive exclamation marks detected ({exclamation_count}).")
        if caps_words / word_count > 0.05:
            risk_factors.append("High ratio of ALL-CAPS words indicating potential sensationalist headline/style.")
        if total_claims > 0 and avg_verifiability < 0.3:
            risk_factors.append("Extracted claims show low empirical verifiability scores.")

        reassuring_cues = []
        if real_prob >= 0.6:
            reassuring_cues.append("Text aligns with authentic news linguistic distribution.")
        if total_entities > 2:
            reassuring_cues.append(f"Identified {total_entities} named entities (persons, organizations, places).")
        if avg_verifiability >= 0.6:
            reassuring_cues.append("High factual assertion and verifiability score in extracted claims.")
        if consensus_score >= 0.3:
            reassuring_cues.append(f"Strong semantic alignment with verified reference sources ({consensus_score * 100:.1f}% consensus).")

        return {
            "overall_confidence": final_confidence,
            "confidence_percentage": confidence_percentage,
            "risk_category": risk_category,
            "verdict": ml_prediction.get("verdict"),
            "is_fake": is_fake,
            "score_components": {
                "ml_probability_score": round(base_ml_conf, 4),
                "claim_verifiability_score": round(avg_verifiability, 4),
                "sensationalism_penalty": round(sensationalism_penalty, 4),
                "semantic_consensus_score": round(consensus_score, 4)
            },
            "risk_factors": risk_factors,
            "reassuring_cues": reassuring_cues
        }
