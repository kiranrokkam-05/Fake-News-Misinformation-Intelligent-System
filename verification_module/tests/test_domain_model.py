from datetime import datetime, timezone

from verification_module.models import (
    EvidenceItem,
    NLIScores,
    Passage,
    ProviderStatus,
    ProviderStatusValue,
    Stance,
    VerificationResult,
    Verdict,
)


def test_rich_evidence_serializes_provenance_and_nli():
    evidence = EvidenceItem(
        source_name="Wikipedia",
        title="Orbit of the Moon",
        snippet="The Moon orbits Earth.",
        url="https://en.wikipedia.org/wiki/Orbit_of_the_Moon",
        provider="wikipedia",
        retrieved_at=datetime.now(timezone.utc),
        permalink="https://en.wikipedia.org/w/index.php?oldid=1",
        revision_id="1",
        passage=Passage("The Moon orbits Earth.", title="Orbit of the Moon"),
        relevance=0.9,
        nli=NLIScores(entailment=0.95, neutral=0.03, contradiction=0.02),
        stance=Stance.SUPPORTS,
    )
    result = VerificationResult(
        claim="The Moon orbits the Earth.",
        verdict=Verdict.SUPPORTS,
        confidence=95.0,
        reason="Evidence supports the claim.",
        evidence=[evidence],
        provider_statuses=[
            ProviderStatus("wikipedia", ProviderStatusValue.OK, n_results=1)
        ],
    )
    payload = result.to_dict()
    assert payload["verdict"] == "SUPPORTS"
    assert payload["evidence"][0]["revision_id"] == "1"
    assert payload["evidence"][0]["nli"]["entailment"] == 0.95
    assert payload["provider_statuses"][0]["status"] == "ok"


def test_legacy_verdict_names_remain_importable():
    assert Verdict.VERIFIED.value == "VERIFIED"
    assert Verdict.FALSE.value == "FALSE / CONTRADICTED"
    assert Verdict.INSUFFICIENT.value == "INSUFFICIENT"
