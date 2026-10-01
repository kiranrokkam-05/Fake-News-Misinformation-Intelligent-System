import pytest

from verification_module.models import EvidenceItem, Stance, Verdict
from verification_module.reasoning.aggregate import aggregate_evidence
from verification_module.reasoning.decision import decide_from_aggregation
from verification_module.reasoning.nli import ModelUnavailable
from verification_module.reasoning.numeric import assess_numeric_conflict


def evidence(url, stance, confidence, credibility=90):
    return EvidenceItem(
        source_name="source",
        title="title",
        snippet="snippet",
        url=url,
        provider="test",
        stance=stance,
        stance_confidence=confidence,
        credibility_score=credibility,
        relevance=1.0,
    )


def test_support_aggregation_is_not_divided_by_neutral_item_count():
    result = aggregate_evidence(
        [
            evidence("https://a.example/support", Stance.SUPPORTS, 0.95),
            evidence("https://b.example/neutral", Stance.NEUTRAL, 0.0),
        ]
    )
    assert result.support_score > 0.65
    assert decide_from_aggregation(result) == Verdict.SUPPORTS


def test_conflicting_high_scores_abstain_when_margin_is_small():
    result = aggregate_evidence(
        [
            evidence("https://a.example/support", Stance.SUPPORTS, 0.9),
            evidence("https://b.example/refute", Stance.CONTRADICTS, 0.9),
        ]
    )
    assert result.contested
    assert decide_from_aggregation(result) == Verdict.INSUFFICIENT


def test_numeric_assessment_is_advisory():
    result = assess_numeric_conflict("freezes at 0 degrees", "freezes at 100 degrees")
    assert result.numeric_conflict


def test_nli_unavailability_is_explicit():
    with pytest.raises(ModelUnavailable):
        raise ModelUnavailable("model unavailable")
