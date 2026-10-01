"""
Shared data structures used across the verification pipeline.

Keeping these as plain dataclasses gives every adapter and stage a
single "Common Evidence Format" to speak, per the project design:

    Search Provider -> Search Adapter -> Common Evidence Format -> Pipeline
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Optional


class Stance(str, Enum):
    """Relationship between a piece of evidence and the claim."""
    SUPPORTS = "supports"
    CONTRADICTS = "contradicts"
    NEUTRAL = "neutral"


class ProviderStatusValue(str, Enum):
    OK = "ok"
    SKIPPED = "skipped"
    ERROR = "error"


@dataclass
class ProviderStatus:
    name: str
    status: ProviderStatusValue
    reason: str = ""
    latency_ms: float = 0.0
    n_results: int = 0


class Verdict(str, Enum):
    SUPPORTS = "SUPPORTS"
    REFUTES = "REFUTES"
    INSUFFICIENT = "INSUFFICIENT"
    VERIFIED = "VERIFIED"
    FALSE = "FALSE / CONTRADICTED"
    PARTIALLY_TRUE = "PARTIALLY TRUE"
    UNVERIFIED = "UNVERIFIED"
    EXISTING_TOPIC_STATUS_NOT_ESTABLISHED = "EXISTING TOPIC / STATUS NOT ESTABLISHED"
    EMERGING_ONGOING = "EMERGING / ONGOING"


@dataclass
class Passage:
    text: str
    title: str = ""
    relevance: float = 0.0
    passage_id: str = ""


@dataclass
class NLIScores:
    entailment: float = 0.0
    neutral: float = 0.0
    contradiction: float = 0.0


@dataclass
class Aggregation:
    support_score: float = 0.0
    refute_score: float = 0.0
    margin: float = 0.0
    selected_sources: int = 0
    contested: bool = False


@dataclass
class EvidenceItem:
    """A single normalized piece of evidence, regardless of which
    search provider it came from. This is the "Common Evidence
    Format" every adapter must return."""

    source_name: str
    title: str
    snippet: str
    url: str
    published_at: Optional[datetime] = None
    provider: str = "unknown"          # which adapter fetched this
    credibility_score: float = 0.0      # 0-100, filled in by credibility.py
    stance: Stance = Stance.NEUTRAL     # filled in by comparison.py
    stance_confidence: float = 0.0      # 0-1, filled in by comparison.py
    permalink: Optional[str] = None
    revision_id: Optional[str] = None
    retrieved_at: Optional[datetime] = None
    source_type: str = "unknown"
    license_note: Optional[str] = None
    passage: Optional[Passage] = None
    relevance: float = 0.0
    weight: float = 0.0
    nli: Optional[NLIScores] = None


@dataclass
class VerificationResult:
    """Final explainable output of the pipeline."""

    claim: str
    verdict: Verdict
    confidence: float                   # 0-100
    reason: str
    evidence: list = field(default_factory=list)  # list[EvidenceItem]
    sources_checked: list = field(default_factory=list)  # list[str]
    topic_exists: Optional[bool] = None
    notes: str = ""
    evidence_strength: float = 0.0
    strength_band: str = "unassessed"
    flags: list[str] = field(default_factory=list)
    aggregation: Optional[Aggregation] = None
    provider_statuses: list[ProviderStatus] = field(default_factory=list)
    explanation: dict[str, Any] = field(default_factory=dict)
    model_versions: dict[str, str] = field(default_factory=dict)
    limitations: list[str] = field(default_factory=list)
    timing_ms: Optional[float] = None

    def to_dict(self) -> dict:
        return {
            "claim": self.claim,
            "verdict": self.verdict.value,
            "confidence": round(self.confidence, 1),
            "reason": self.reason,
            "topic_exists": self.topic_exists,
            "notes": self.notes,
            "evidence_strength": round(self.evidence_strength, 3),
            "strength_band": self.strength_band,
            "flags": self.flags,
            "sources_checked": self.sources_checked,
            "provider_statuses": [
                {
                    "name": status.name,
                    "status": status.status.value,
                    "reason": status.reason,
                    "latency_ms": round(status.latency_ms, 1),
                    "n_results": status.n_results,
                }
                for status in self.provider_statuses
            ],
            "evidence": [
                {
                    "source_name": e.source_name,
                    "title": e.title,
                    "snippet": e.snippet,
                    "url": e.url,
                    "provider": e.provider,
                    "published_at": e.published_at.isoformat() if e.published_at else None,
                    "credibility_score": round(e.credibility_score, 1),
                    "stance": e.stance.value,
                    "stance_confidence": round(e.stance_confidence, 2),
                    "permalink": e.permalink,
                    "revision_id": e.revision_id,
                    "retrieved_at": e.retrieved_at.isoformat() if e.retrieved_at else None,
                    "source_type": e.source_type,
                    "license_note": e.license_note,
                    "passage": e.passage.text if e.passage else None,
                    "relevance": round(e.relevance, 3),
                    "weight": round(e.weight, 3),
                    "nli": (
                        {
                            "entailment": round(e.nli.entailment, 3),
                            "neutral": round(e.nli.neutral, 3),
                            "contradiction": round(e.nli.contradiction, 3),
                        }
                        if e.nli
                        else None
                    ),
                }
                for e in self.evidence
            ],
            "aggregation": (
                {
                    "support_score": round(self.aggregation.support_score, 3),
                    "refute_score": round(self.aggregation.refute_score, 3),
                    "margin": round(self.aggregation.margin, 3),
                    "selected_sources": self.aggregation.selected_sources,
                    "contested": self.aggregation.contested,
                }
                if self.aggregation
                else None
            ),
            "explanation": self.explanation,
            "model_versions": self.model_versions,
            "limitations": self.limitations,
            "timing_ms": self.timing_ms,
        }
