import math
import re


def _tokens(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text.lower()))


def lexical_relevance(query: str, text: str) -> float:
    query_tokens = _tokens(query)
    if not query_tokens:
        return 0.0
    overlap = len(query_tokens & _tokens(text)) / len(query_tokens)
    return round(min(1.0, overlap), 4)
