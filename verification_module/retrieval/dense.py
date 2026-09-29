"""Optional dense ranking adapter with a deterministic CPU fallback."""

from verification_module.retrieval.bm25 import lexical_relevance


def dense_relevance(query: str, text: str) -> float:
    # Dense models are optional in the CPU baseline; lexical relevance keeps
    # the interface deterministic until a pinned encoder is configured.
    return lexical_relevance(query, text)
