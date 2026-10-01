from verification_module.retrieval.bm25 import lexical_relevance
from verification_module.retrieval.dense import dense_relevance


def hybrid_relevance(query: str, text: str) -> float:
    lexical = lexical_relevance(query, text)
    dense = dense_relevance(query, text)
    return round((lexical + dense) / 2.0, 4)
