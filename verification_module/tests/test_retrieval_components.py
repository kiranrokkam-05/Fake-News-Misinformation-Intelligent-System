from verification_module.claims.entities import extract_structure
from verification_module.retrieval.hybrid import hybrid_relevance
from verification_module.retrieval.passages import sentence_windows
from verification_module.retrieval.queries import generate_claim_queries


def test_query_generation_preserves_numbers_and_entities():
    queries = generate_claim_queries(
        "The Earth revolves around the Sun once every 365.25 days."
    )
    assert queries[0].endswith("365.25 days.")
    assert any("Earth" in query for query in queries)
    assert "365.25" in extract_structure(queries[0]).quantities


def test_sentence_windows_include_page_title():
    passages = sentence_windows(
        "The Moon orbits Earth. It completes one orbit in about 27 days.",
        "Orbit of the Moon",
    )
    assert passages
    assert passages[0].text.startswith("Orbit of the Moon:")


def test_hybrid_relevance_is_bounded():
    score = hybrid_relevance("Moon orbits Earth", "The Moon orbits Earth.")
    assert 0.0 <= score <= 1.0
