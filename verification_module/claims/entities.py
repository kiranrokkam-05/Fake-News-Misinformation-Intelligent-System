import re
from dataclasses import dataclass


@dataclass
class ClaimStructure:
    entities: list[str]
    quantities: list[str]
    tokens: list[str]


def extract_structure(claim: str) -> ClaimStructure:
    tokens = re.findall(r"[A-Za-z0-9]+(?:[.,][A-Za-z0-9]+)*", claim)
    quantities = [token for token in tokens if re.search(r"\d", token)]
    entities = [
        token
        for token in tokens
        if token[:1].isupper() and token.lower() not in {"The", "A", "An"}
    ]
    return ClaimStructure(entities=entities, quantities=quantities, tokens=tokens)
