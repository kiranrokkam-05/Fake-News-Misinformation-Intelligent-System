"""
Decision Engine.

Takes claim + credibility-scored, stance-labeled evidence and returns
one of the six project verdicts, weighting each piece of evidence by
its source credibility so an anonymous blog post can't outvote an
official government source.

    Supported    -> VERIFIED
    Contradicted -> FALSE / CONTRADICTED
    Mixed        -> PARTIALLY TRUE
    Insufficient -> UNVERIFIED / EXISTING TOPIC / EMERGING-ONGOING
                    (further status analysis, see _classify_insufficient)
"""

from typing import List

from verification_module import config
from verification_module.models import EvidenceItem, Stance, Verdict, VerificationResult


def _weighted_stance_scores(evidence: List[EvidenceItem]) -> dict:
    """Credibility-weighted average score per stance, on a 0-1 scale.

    IMPORTANT: this averages over the TOTAL number of evidence items,
    not over the sum of weights. Normalizing by total weight would let
    a single low-confidence, low-credibility item look like "100%
    support" just because it's the only vote cast -- averaging by
    count means weak evidence stays weak instead of being inflated.
    """
    n = len(evidence)
    if n == 0:
        return {"supports": 0.0, "contradicts": 0.0, "neutral": 0.0}

    totals = {Stance.SUPPORTS: 0.0, Stance.CONTRADICTS: 0.0, Stance.NEUTRAL: 0.0}
    for item in evidence:
        weight = (item.credibility_score / 100.0) * item.stance_confidence
        totals[item.stance] += weight

    return {
        "supports": totals[Stance.SUPPORTS] / n,
        "contradicts": totals[Stance.CONTRADICTS] / n,
        "neutral": totals[Stance.NEUTRAL] / n,
    }


def _classify_insufficient(claim: str, evidence: List[EvidenceItem], topic_exists: bool) -> Verdict:
    """When evidence doesn't clearly support or contradict, decide
    among UNVERIFIED / EXISTING TOPIC.../ EMERGING-ONGOING.

    TODO: a real version should use the NLP module's temporal
    analysis (Step 12) to distinguish "still developing" (EMERGING)
    from "topic exists but this specific claim is unaddressed"
    (EXISTING TOPIC). For the skeleton we use `topic_exists` (from
    the Wikipedia baseline check) as the deciding signal.
    """
    if topic_exists:
        return Verdict.EXISTING_TOPIC_STATUS_NOT_ESTABLISHED
    return Verdict.UNVERIFIED


def decide(claim: str, evidence: List[EvidenceItem], topic_exists: bool = False) -> VerificationResult:
    sources_checked = sorted({e.provider for e in evidence})

    if len(evidence) < config.MIN_EVIDENCE_FOR_DECISION:
        return VerificationResult(
            claim=claim,
            verdict=Verdict.UNVERIFIED,
            confidence=0.0,
            reason="No evidence could be retrieved from any configured source.",
            evidence=evidence,
            sources_checked=sources_checked,
            topic_exists=topic_exists,
            notes="Absence of evidence is not treated as evidence of falsity.",
        )

    scores = _weighted_stance_scores(evidence)
    support, contradict = scores["supports"], scores["contradicts"]

    if support >= config.SUPPORT_THRESHOLD and contradict < 0.2:
        verdict = Verdict.VERIFIED
        confidence = support * 100
        reason = "Reliable evidence supports the claim."
    elif contradict >= config.CONTRADICTION_THRESHOLD and support < 0.2:
        verdict = Verdict.FALSE
        confidence = contradict * 100
        reason = "Reliable evidence contradicts the claim."
    elif support > 0.3 and contradict > 0.3:
        verdict = Verdict.PARTIALLY_TRUE
        confidence = 100 - abs(support - contradict) * 100
        reason = "Some evidence supports the claim while other evidence disputes part of it."
    else:
        verdict = _classify_insufficient(claim, evidence, topic_exists)
        confidence = max(support, contradict, scores["neutral"]) * 60  # cap: low confidence
        if verdict == Verdict.EXISTING_TOPIC_STATUS_NOT_ESTABLISHED:
            reason = (
                "This topic/technology already exists, but the specific claim or "
                "current status could not be established from reliable evidence."
            )
        else:
            reason = "No reliable source was found that establishes the specific claim."

    return VerificationResult(
        claim=claim,
        verdict=verdict,
        confidence=confidence,
        reason=reason,
        evidence=evidence,
        sources_checked=sources_checked,
        topic_exists=topic_exists,
        notes="Absence of evidence is not treated as evidence of falsity.",
    )
