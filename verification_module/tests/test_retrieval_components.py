from verification_module.claims.entities import extract_structure
from verification_module.retrieval.hybrid import hybrid_relevance
from verification_module.retrieval.passages import sentence_windows
from verification_module.retrieval.queries import generate_claim_queries


def test_query_generation_preserves_numbers_and_entities():
    claim = "The Earth revolves around the Sun once every 365.25 days."
    queries = generate_claim_queries(claim)
    assert queries
    assert any("Earth" in query for query in queries)
    assert any("365.25" in extract_structure(query).quantities for query in queries)
    assert all(len(query.split()) <= 10 for query in queries)
    assert claim not in queries


def test_long_article_queries_are_concise_and_use_salient_terms():
    article = (
        "Investors and economists are expecting the Reserve Bank of India to consider "
        "raising interest rates as inflationary pressures increase by 25 basis points. "
        "Officials will meet next week to discuss the monetary policy decision."
    )
    queries = generate_claim_queries(article)
    assert 1 <= len(queries) <= 3
    assert all(len(query.split()) <= 10 for query in queries)
    assert any("Reserve" in query and "India" in query and "25" in query for query in queries)
    assert all(len(query) < len(article) for query in queries)


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
