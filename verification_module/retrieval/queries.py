from verification_module.claims.entities import extract_structure
from verification_module.claims.normalize import normalize_claim


def generate_claim_queries(claim: str) -> list[str]:
    normalized = normalize_claim(claim)
    structure = extract_structure(normalized)
    queries = [normalized]
    if structure.entities:
        queries.append(" ".join(structure.entities))
    if structure.entities and structure.tokens:
        relation_tokens = [
            token
            for token in structure.tokens
            if token.lower() not in {entity.lower() for entity in structure.entities}
        ]
        if relation_tokens:
            queries.append(" ".join(structure.entities + relation_tokens[:6]))
    return list(dict.fromkeys(query for query in queries if query))
