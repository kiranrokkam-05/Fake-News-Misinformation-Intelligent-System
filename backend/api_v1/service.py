import time
from uuid import uuid4

from verification_module.claims.entities import extract_structure
from verification_module.evidence_retrieval import (
    generate_queries,
    retrieve_evidence_with_status,
)
from verification_module.models import NLIScores, Stance, Verdict
from verification_module.reasoning.aggregate import aggregate_evidence
from verification_module.reasoning.decision import decide_from_aggregation
from verification_module.reasoning.nli import load_nli_model
from verification_module.credibility import score_all


class EvidenceService:
    def __init__(self):
        self._nli = None

    def readiness(self) -> dict:
        try:
            self._get_nli()
            return {"ready": True, "nli_model": "MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli"}
        except Exception as exc:
            return {"ready": False, "reason": str(exc)}

    def _get_nli(self):
        if self._nli is None:
            self._nli = load_nli_model()
        return self._nli

    def verify(self, claim: str, max_evidence: int, include_baseline: bool = False) -> dict:
        started = time.perf_counter()
        nli = self._get_nli()
        retrieval = retrieve_evidence_with_status(claim)
        evidence = retrieval.evidence[:max_evidence]
        score_all(evidence)
        pairs = [(item.passage.text, claim) for item in evidence if item.passage]
        scores = nli.score_batch([pair[0] for pair in pairs], [pair[1] for pair in pairs])
        for item, score in zip(evidence, scores):
            item.nli = NLIScores(
                entailment=score["entailment"],
                neutral=score["neutral"],
                contradiction=score["contradiction"],
            )
            item.stance_confidence = max(score.values())
            item.stance = (
                Stance.SUPPORTS
                if score["entailment"] == item.stance_confidence
                else Stance.CONTRADICTS
                if score["contradiction"] == item.stance_confidence
                else Stance.NEUTRAL
            )
            item.weight = max(0.5, min(1.0, item.credibility_score / 100.0))
        aggregation = aggregate_evidence(evidence)
        verdict = decide_from_aggregation(aggregation)
        flags = []
        if not evidence:
            flags.append("no_evidence")
        if aggregation.contested:
            flags.append("contested")
        structure = extract_structure(claim)
        evidence_strength = max(
            aggregation.support_score, aggregation.refute_score
        )
        result = {
            "request_id": str(uuid4()),
            "pipeline_version": "api-v1-evidence-nli",
            "claim": {
                "text": claim,
                "entities": structure.entities,
                "quantities": structure.quantities,
            },
            "verdict": verdict.value,
            "evidence_strength": round(evidence_strength, 4),
            "strength_band": (
                "strong" if evidence_strength >= 0.75 else
                "moderate" if evidence_strength >= 0.5 else
                "insufficient"
            ),
            "calibration": {"status": "uncalibrated"},
            "flags": flags,
            "evidence": [
                {
                    "id": item.passage.passage_id if item.passage else item.url,
                    "stance": item.stance.value,
                    "passage": item.passage.text if item.passage else item.snippet,
                    "relevance": item.relevance,
                    "nli": {
                        "entail": item.nli.entailment if item.nli else 0.0,
                        "neutral": item.nli.neutral if item.nli else 0.0,
                        "contradict": item.nli.contradiction if item.nli else 0.0,
                    },
                    "weight": item.weight,
                    "source": {
                        "provider": item.provider,
                        "title": item.title,
                        "url": item.url,
                        "permalink": item.permalink,
                        "revision_id": item.revision_id,
                        "source_type": item.source_type,
                        "published_at": item.published_at.isoformat() if item.published_at else None,
                        "retrieved_at": item.retrieved_at.isoformat() if item.retrieved_at else None,
                        "license": item.license_note,
                    },
                }
                for item in evidence
            ],
            "aggregation": {
                "support_score": aggregation.support_score,
                "refute_score": aggregation.refute_score,
                "margin": aggregation.margin,
                "selected_sources": aggregation.selected_sources,
                "contested": aggregation.contested,
            },
            "retrieval": {
                "queries": generate_queries(claim),
                "providers": [
                    {
                        "name": status.name,
                        "status": status.status.value,
                        "reason": status.reason,
                        "latency_ms": status.latency_ms,
                        "n_results": status.n_results,
                    }
                    for status in retrieval.provider_statuses
                ],
            },
            "explanation": {
                "summary": (
                    "No sufficient evidence was found."
                    if verdict == Verdict.INSUFFICIENT
                    else f"Retrieved evidence assessed as {verdict.value}."
                ),
                "steps": [
                    "Generated deterministic claim queries.",
                    "Retrieved provider documents and passages.",
                    "Assessed passage entailment with the NLI model.",
                    "Aggregated independent source signals.",
                ],
            },
            "models": {
                "evidence_assessment": "MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli",
                "baseline": (
                    {"status": "available", "non_evidence": True}
                    if include_baseline
                    else None
                ),
            },
            "limitations": [
                "NLI scores are uncalibrated and are not probabilities of factual truth.",
                "Authority and retrieval relevance do not guarantee source correctness.",
                "The pipeline does not independently prove claims.",
            ],
            "timing_ms": round((time.perf_counter() - started) * 1000, 2),
        }
        return result


evidence_service = EvidenceService()
