"""
Claim <-> Evidence Comparison.

Determines, for each EvidenceItem, whether it SUPPORTS, CONTRADICTS,
or is NEUTRAL toward the claim (project doc Step 11: NLI /
claim-evidence relationship).

This skeleton uses a simple lexical-overlap + negation-cue heuristic
as a stand-in. The NLP & ML Developer's real Sentence-BERT /
NLI-transformer model should replace `_stance_for_pair()` -- the rest
of the pipeline (decision engine, explainability) does not need to
change when that swap happens, since they only consume
`item.stance` / `item.stance_confidence`.
"""

import re
from typing import List

from verification_module.models import EvidenceItem, Stance

_NEGATION_CUES = {
    "not", "false", "never", "hoax", "denied", "debunked", "incorrect",
    "no evidence", "did not", "didn't", "disproven", "misleading",
}

_CONFIRMATION_CUES = {
    "confirmed", "true", "verified", "official", "successfully", "indeed",
    "accurate", "correct",
}


def _tokenize(text: str) -> set:
    return set(re.findall(r"[a-z0-9]+", text.lower()))


def _has_cue(text_lower: str, tokens: set, cues: set) -> bool:
    """Check cue words/phrases with word-boundary safety.

    Single-word cues are matched against the tokenized word set (so
    "correct" never matches inside "incorrect"). Multi-word phrases
    ("did not", "no evidence") are matched as substrings since
    tokenizing would break them apart.
    """
    for cue in cues:
        if " " in cue:
            if cue in text_lower:
                return True
        elif cue in tokens:
            return True
    return False


def _stance_for_pair(claim: str, evidence: EvidenceItem) -> (Stance, float):
    """STUB stance detection using lexical overlap + cue words.

    TODO: replace with real NLI (e.g. a `roberta-large-mnli` style
    model) or Sentence-BERT cosine similarity + entailment
    classifier from the NLP & ML Developer's module.
    """

    claim_tokens = _tokenize(claim)
    evidence_text = f"{evidence.title} {evidence.snippet}"
    evidence_tokens = _tokenize(evidence_text)

    if not claim_tokens:
        return Stance.NEUTRAL, 0.0

    overlap = len(claim_tokens & evidence_tokens) / len(claim_tokens)
    lowered = evidence_text.lower()

    has_negation = _has_cue(lowered, evidence_tokens, _NEGATION_CUES)
    has_confirmation = _has_cue(lowered, evidence_tokens, _CONFIRMATION_CUES)

    if overlap < 0.2:
        # Evidence barely mentions the claim's content at all.
        return Stance.NEUTRAL, round(0.3 + overlap, 2)

    if has_negation and not has_confirmation:
        return Stance.CONTRADICTS, round(min(0.9, 0.5 + overlap), 2)

    if has_confirmation and not has_negation:
        return Stance.SUPPORTS, round(min(0.9, 0.5 + overlap), 2)

    # Overlap is decent but no clear cue word either way -> treat as
    # weak support proportional to overlap.
    return Stance.SUPPORTS, round(min(0.7, overlap), 2)


def compare_claim_to_evidence(claim: str, evidence: List[EvidenceItem]) -> List[EvidenceItem]:
    """Mutate and return evidence list with stance + stance_confidence filled in."""
    for item in evidence:
        stance, confidence = _stance_for_pair(claim, item)
        item.stance = stance
        item.stance_confidence = confidence
    return evidence
