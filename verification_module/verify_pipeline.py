"""
Top-level orchestrator for the Verification & Integration module.

    claim (already extracted by the NLP module)
        -> evidence retrieval
        -> source credibility scoring
        -> claim<->evidence comparison
        -> decision engine
        -> explainability
        -> VerificationResult

This is the single function the Backend Developer's API layer should
call: `verify_claim(claim_text)`.
"""

from verification_module.comparison import compare_claim_to_evidence
from verification_module.credibility import score_all
from verification_module.decision_engine import decide
from verification_module.evidence_retrieval import retrieve_evidence_with_status
from verification_module.explainability import format_report
from verification_module.models import VerificationResult


def _topic_exists(evidence) -> bool:
    """Only call the topic related when a passage has meaningful overlap.

    An unrelated search hit must not turn an inconclusive result into an
    ``EXISTING TOPIC`` verdict merely because a provider returned a page.
    """
    return any(item.stance_confidence >= 0.5 for item in evidence)


def verify_claim(claim: str) -> VerificationResult:
    """Run the full verification pipeline on an already-extracted claim.

    NOTE: `claim` here is expected to already be the output of the
    NLP & ML Developer's claim-extraction step (project doc Step 7),
    not raw user input. Extraction/OCR happen upstream of this module.
    """
    if not claim or not claim.strip():
        raise ValueError("verify_claim() requires a non-empty claim string")

    retrieval = retrieve_evidence_with_status(claim)
    evidence = retrieval.evidence
    evidence = score_all(evidence)
    evidence = compare_claim_to_evidence(claim, evidence)

    topic_exists = _topic_exists(evidence)
    result = decide(claim, evidence, topic_exists=topic_exists)
    result.provider_statuses = retrieval.provider_statuses
    result.search_queries = retrieval.queries
    return result


if __name__ == "__main__":
    # Quick manual smoke test:
    #   python -m verification_module.verify_pipeline
    demo_claim = "ISRO successfully landed Chandrayaan-3 on the Moon in 2023."
    result = verify_claim(demo_claim)
    print(format_report(result))
