import re
from dataclasses import dataclass


@dataclass
class NumericAssessment:
    claim_quantities: list[str]
    evidence_quantities: list[str]
    numeric_conflict: bool = False


def assess_numeric_conflict(claim: str, evidence: str) -> NumericAssessment:
    number_pattern = r"\b\d+(?:\.\d+)?\b"
    claim_values = re.findall(number_pattern, claim)
    evidence_values = re.findall(number_pattern, evidence)
    conflict = bool(claim_values and evidence_values and not set(claim_values) & set(evidence_values))
    return NumericAssessment(claim_values, evidence_values, conflict)
