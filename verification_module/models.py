"""
Shared data structures used across the verification pipeline.

Keeping these as plain dataclasses gives every adapter and stage a
single "Common Evidence Format" to speak, per the project design:

    Search Provider -> Search Adapter -> Common Evidence Format -> Pipeline
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional


class Stance(str, Enum):
    """Relationship between a piece of evidence and the claim."""
    SUPPORTS = "supports"
    CONTRADICTS = "contradicts"
    NEUTRAL = "neutral"


class Verdict(str, Enum):
    VERIFIED = "VERIFIED"
    FALSE = "FALSE / CONTRADICTED"
    PARTIALLY_TRUE = "PARTIALLY TRUE"
    UNVERIFIED = "UNVERIFIED"
    EXISTING_TOPIC_STATUS_NOT_ESTABLISHED = "EXISTING TOPIC / STATUS NOT ESTABLISHED"
    EMERGING_ONGOING = "EMERGING / ONGOING"


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

    def to_dict(self) -> dict:
        return {
            "claim": self.claim,
            "verdict": self.verdict.value,
            "confidence": round(self.confidence, 1),
            "reason": self.reason,
            "topic_exists": self.topic_exists,
            "notes": self.notes,
            "sources_checked": self.sources_checked,
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
                }
                for e in self.evidence
            ],
        }
