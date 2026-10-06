from typing import Any, Dict, Optional


class ConfidenceCalculator:
    """Describe model scores without presenting them as calibrated confidence.

    The previous implementation blended an uncalibrated SVM score with
    sensationalism and heuristic claim features. That composite was not a
    probability of correctness, so this class now reports the independent
    classifier signal and leaves final decisions to the evidence-aware layer.
    """

    def calculate_confidence(
        self,
        ml_prediction: Dict[str, Any],
        claims_analysis: Dict[str, Any],
        preprocessed_meta: Dict[str, Any],
        consensus_analysis: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        fake_score = ml_prediction.get("fake_score", ml_prediction.get("fake_probability"))
        real_score = ml_prediction.get("real_score", ml_prediction.get("real_probability"))
        return {
            # Keep old keys so API clients do not fail, but null makes clear
            # that no calibrated probability is available for this artifact.
            "overall_confidence": None,
            "confidence_percentage": None,
            "confidence_type": "not_calibrated",
            "probability_calibrated": bool(ml_prediction.get("probability_calibrated", False)),
            "risk_category": ml_prediction.get("verdict", "SUSPICIOUS / UNCERTAIN"),
            "verdict": ml_prediction.get("verdict"),
            "is_fake": ml_prediction.get("is_fake"),
            "score_components": {
                "fake_score": fake_score,
                "real_score": real_score,
                "decision_margin": ml_prediction.get("decision_margin"),
                "margin_threshold": ml_prediction.get("margin_threshold"),
                "claims_extracted": claims_analysis.get("total_claims", 0),
                "entities_extracted": claims_analysis.get("total_entities", 0),
            },
            "risk_factors": [],
            "reassuring_cues": [],
            "explanation": (
                "Classifier scores are not calibrated probabilities. The final assessment "
                "combines this linguistic model signal with retrieved evidence separately."
            ),
        }
