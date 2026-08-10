"""
Basic tests for the verification pipeline stages.

These use hand-built EvidenceItem objects instead of real network
calls, so they run offline and don't need any API keys -- good for
CI and for demoing that the logic works before real keys are added.

Run with:  pytest verification_module/tests/test_pipeline.py -v
"""

import sys
from pathlib import Path

# Allow running this file directly (adds project root to path).
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from verification_module.comparison import compare_claim_to_evidence
from verification_module.credibility import score_source
from verification_module.decision_engine import decide
from verification_module.models import EvidenceItem, Verdict


def make_evidence(url, title, snippet, provider="test"):
    return EvidenceItem(
        source_name=url, title=title, snippet=snippet, url=url, provider=provider
    )


def test_credibility_high_for_gov_domain():
    item = make_evidence("https://www.isro.gov.in/news", "ISRO update", "...")
    assert score_source(item) >= 80


def test_credibility_neutral_for_unknown_domain():
    item = make_evidence("https://randomblog.example/post", "Some post", "...")
    assert 30 <= score_source(item) <= 50


def test_comparison_detects_support():
    claim = "ISRO landed Chandrayaan-3 on the Moon"
    evidence = [
        make_evidence(
            "https://isro.gov.in/c3",
            "Chandrayaan-3 Moon landing confirmed",
            "ISRO officially confirmed the Chandrayaan-3 successful Moon landing.",
        )
    ]
    result = compare_claim_to_evidence(claim, evidence)
    assert result[0].stance.value == "supports"


def test_comparison_detects_contradiction():
    claim = "Chandrayaan-3 landed on Mars"
    evidence = [
        make_evidence(
            "https://isro.gov.in/c3",
            "Chandrayaan-3 Mars claim is false",
            "This is incorrect: Chandrayaan-3 never went to Mars, it landed on the Moon.",
        )
    ]
    result = compare_claim_to_evidence(claim, evidence)
    assert result[0].stance.value == "contradicts"


def test_decision_verified_when_supported():
    claim = "ISRO landed Chandrayaan-3 on the Moon"
    evidence = [
        make_evidence(
            "https://isro.gov.in/c3",
            "Chandrayaan-3 Moon landing confirmed",
            "ISRO officially confirmed the successful Moon landing.",
        )
    ]
    evidence = compare_claim_to_evidence(claim, evidence)
    for item in evidence:
        item.credibility_score = 90.0
    result = decide(claim, evidence, topic_exists=True)
    assert result.verdict == Verdict.VERIFIED


def test_decision_unverified_when_no_evidence():
    result = decide("Some totally novel claim", [], topic_exists=False)
    assert result.verdict == Verdict.UNVERIFIED


def test_decision_existing_topic_when_no_stance_signal_but_topic_exists():
    claim = "XYZ Corp secretly deployed teleportation tech worldwide"
    evidence = [
        make_evidence(
            "https://en.wikipedia.org/wiki/XYZ_Corp",
            "XYZ Corp",
            "XYZ Corp is a technology company researching various prototypes.",
            provider="wikipedia",
        )
    ]
    evidence = compare_claim_to_evidence(claim, evidence)
    for item in evidence:
        item.credibility_score = 90.0
        item.stance_confidence = 0.1  # weak signal either way
    result = decide(claim, evidence, topic_exists=True)
    assert result.verdict in (
        Verdict.EXISTING_TOPIC_STATUS_NOT_ESTABLISHED,
        Verdict.UNVERIFIED,
    )


if __name__ == "__main__":
    import pytest
    raise SystemExit(pytest.main([__file__, "-v"]))
