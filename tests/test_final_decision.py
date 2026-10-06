from backend.final_decision import decide_final
from unittest.mock import patch


def classifier(verdict="SUSPICIOUS / UNCERTAIN", margin=0.4):
    return {
        "applicable": True,
        "verdict": verdict,
        "decision_margin": margin,
        "fake_score": 0.65,
        "real_score": 0.35,
        "score_kind": "uncalibrated_sigmoid_of_svm_margin",
        "probability_calibrated": False,
    }


def verification(verdict="UNVERIFIED", evidence=None, statuses=None):
    return {
        "verdict": verdict,
        "confidence": 75 if evidence else 0,
        "evidence": evidence or [],
        "sources_checked": ["test"] if evidence else [],
        "provider_statuses": statuses if statuses is not None else [{"name": "test", "status": "ok", "n_results": len(evidence or [])}],
        "reason": "No establishing evidence.",
    }


def test_supporting_evidence_resolves_moderate_fake_signal_as_real():
    result = decide_final(classifier(margin=0.8), verification("VERIFIED", [{"stance": "supports"}]))
    assert result["status"] == "REAL"
    assert result["rule"] == "evidence_supports_claim"


def test_strong_conflict_is_suspicious_not_forced_to_a_side():
    result = decide_final(classifier("FAKE", margin=1.3), verification("VERIFIED", [{"stance": "supports"}]))
    assert result["status"] == "SUSPICIOUS / UNCERTAIN"


def test_provider_failures_are_unverified_not_fake():
    result = decide_final(
        classifier("FAKE", margin=1.5),
        verification("UNVERIFIED", statuses=[{"name": "gnews", "status": "error", "reason": "429"}]),
    )
    assert result["status"] == "UNVERIFIED"
    assert "not evidence" in result["reason"]


def test_completed_search_with_no_results_requires_strong_classifier_margin():
    strong = decide_final(classifier("FAKE", margin=1.2), verification())
    weak = decide_final(classifier("SUSPICIOUS / UNCERTAIN", margin=0.9), verification())
    assert strong["status"] == "FAKE"
    assert strong["rule"] == "classifier_only_strong_margin"
    assert weak["status"] == "UNVERIFIED"


def test_conflicting_strong_evidence_and_real_classifier_are_suspicious():
    result = decide_final(classifier("REAL", margin=-1.4), verification("FALSE / CONTRADICTED", [{"stance": "contradicts"}]))
    assert result["status"] == "SUSPICIOUS / UNCERTAIN"


def test_inconclusive_evidence_is_not_misreported_as_verified():
    result = decide_final(classifier("REAL", margin=-1.5), verification("EXISTING TOPIC / STATUS NOT ESTABLISHED", [{"stance": "neutral"}]))
    assert result["status"] == "UNVERIFIED"
    assert result["rule"] == "inconclusive_evidence"


def test_combined_check_route_returns_both_signals_and_final_reason():
    from backend.app import app

    analysis = {
        "classification": classifier("SUSPICIOUS / UNCERTAIN", 0.7),
        "claims_and_entities": {"claims": [{"text": "The test claim is supported.", "verifiability_score": 0.8, "entities": [], "sentence_index": 0}]},
    }
    verify_result = verification("VERIFIED", [{"stance": "supports"}])
    class Verification:
        def to_dict(self):
            return verify_result
    with patch("backend.app.get_pipeline") as pipeline, patch("backend.app.verify_claim", return_value=Verification()):
        pipeline.return_value.analyze_text.return_value = analysis
        response = app.test_client().post("/api/check", json={"text": "The test claim is supported."})
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["verification_focus"] == "The test claim is supported."
    assert payload["final_decision"]["status"] == "REAL"
    assert payload["analysis"]["classification"]["verdict"] == "SUSPICIOUS / UNCERTAIN"
