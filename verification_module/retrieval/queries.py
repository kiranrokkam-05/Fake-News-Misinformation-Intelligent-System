import re

from verification_module.claims.entities import extract_structure
from verification_module.claims.normalize import normalize_claim


_STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "as", "at", "be", "because", "been", "before", "being", "below",
    "between", "both", "but", "by", "can", "could", "did", "do", "does", "doing",
    "down", "during", "each", "few", "for", "from", "further", "had", "has", "have",
    "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how",
    "i", "if", "in", "into", "is", "it", "its", "itself", "just", "more", "most",
    "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
    "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should",
    "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves",
    "then", "there", "these", "they", "this", "those", "through", "to", "too", "under",
    "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while",
    "who", "whom", "why", "will", "with", "would", "you", "your", "yours",
    "according", "reportedly", "said", "says", "stated", "told", "expect", "expects",
    "expecting", "consider", "considers", "considering", "believe", "believes",
    "investors", "economists", "pressures",
}
_TOKEN_RE = re.compile(r"[A-Za-z0-9]+(?:[.,][A-Za-z0-9]+)*%?")


def _sentence_candidates(text: str) -> list[str]:
    sentences = [part.strip() for part in re.split(r"(?<=[.!?])\s+|[\r\n]+", text) if part.strip()]
    if len(sentences) <= 1:
        return sentences or [text]
    # Longer news input often has an introductory sentence and then specific
    # assertions. Prefer two information-rich sentences rather than searching
    # the entire article as one provider query.
    ranked = sorted(
        enumerate(sentences),
        key=lambda pair: (
            min(len(_TOKEN_RE.findall(pair[1])), 40)
            + 3 * len(extract_structure(pair[1]).entities)
            + 2 * len(extract_structure(pair[1]).quantities),
            -pair[0],
        ),
        reverse=True,
    )
    return [sentence for _, sentence in ranked[:2]]


def _terms(sentence: str) -> tuple[list[str], list[str]]:
    tokens = _TOKEN_RE.findall(sentence)
    structure = extract_structure(sentence)
    entities = {token.lower() for entity in structure.entities for token in _TOKEN_RE.findall(entity)}
    # The first ordinary capitalized word in a sentence is often just
    # sentence-initial capitalization, not a named entity. Keep acronyms.
    if tokens and tokens[0].istitle() and not tokens[0].isupper():
        entities.discard(tokens[0].lower())
    quantities = {token.lower() for token in structure.quantities}
    selected = []
    for token in tokens:
        low = token.lower()
        if low in _STOP_WORDS or len(low) < 2 and not low.isdigit():
            continue
        if low not in {item.lower() for item in selected}:
            selected.append(token)
    priority = [token for token in selected if token.lower() in entities or token.lower() in quantities]
    rest = [token for token in selected if token.lower() not in entities and token.lower() not in quantities]
    return selected, priority + rest


def generate_claim_queries(claim: str) -> list[str]:
    """Build a few short, de-duplicated search phrases from claim sentences.

    Preserve named entities and quantities, remove common grammatical/reporting
    words, and cap each query at ten tokens. The entire article is never sent
    as a single search query.
    """
    normalized = normalize_claim(claim)
    queries: list[str] = []
    candidates = _sentence_candidates(normalized)
    for sentence in candidates:
        original, prioritized = _terms(sentence)
        if not prioritized:
            continue
        keep = {token.lower() for token in prioritized[:10]}
        primary_terms = [token for token in original if token.lower() in keep][:10]
        primary = " ".join(primary_terms)
        if primary and primary.lower() not in {query.lower() for query in queries}:
            queries.append(primary)

        if len(queries) >= 2:
            break

    # When a single long sentence is all we have, add one narrower variant.
    # For multi-sentence input, use the second query slot for a second claim.
    if len(queries) == 1 and len(candidates) == 1:
        _, prioritized = _terms(candidates[0])
        if len(prioritized) > 7:
            compact_keep = {token.lower() for token in prioritized[:7]}
            compact = [token for token in _TOKEN_RE.findall(candidates[0]) if token.lower() in compact_keep][:7]
            variant = " ".join(compact)
            if variant and variant.lower() != queries[0].lower():
                queries.append(variant)
    return queries[:2]
