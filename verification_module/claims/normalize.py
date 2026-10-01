import re


def normalize_claim(claim: str) -> str:
    """Normalize whitespace while preserving numbers, units, and dates."""
    text = re.sub(r"\s+", " ", claim.strip())
    return text
