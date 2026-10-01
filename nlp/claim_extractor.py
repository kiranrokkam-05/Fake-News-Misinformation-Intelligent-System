import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict

import spacy
from .preprocessor import TextPreprocessor


@dataclass
class Claim:
    claim_id: int
    text: str
    sentence_index: int
    claim_type: str
    verifiability_score: float
    entities: List[Dict[str, str]]
    assertion_verbs: List[str]
    has_numerical_data: bool


class ClaimExtractor:
    """
    Extracts verifiable factual claims, statistical assertions, quotes,
    and named entities from text using NLP syntactic rules & SpaCy NER.
    """

    def __init__(self, spacy_model: str = "en_core_web_sm"):
        self.preprocessor = TextPreprocessor()
        self.nlp = None
        try:
            self.nlp = spacy.load(spacy_model)
        except Exception:
            try:
                import en_core_web_sm
                self.nlp = en_core_web_sm.load()
            except Exception:
                self.nlp = None

        # Factual assertion & reporting verbs
        self.reporting_verbs = {
            'said', 'stated', 'claimed', 'reported', 'announced', 'alleged', 'declared',
            'asserted', 'revealed', 'confirmed', 'denied', 'argued', 'proved', 'found',
            'showed', 'suggested', 'insisted', 'demanded', 'acknowledged', 'admitted',
            'warned', 'predicted', 'concluded', 'signed', 'voted', 'passed', 'approved'
        }

        # Subjective opinion indicators
        self.opinion_indicators = {
            'i think', 'i believe', 'in my opinion', 'feel like', 'seems to me',
            'presumably', 'probably', 'maybe', 'arguably', 'ugly', 'wonderful',
            'terrible', 'horrible', 'amazing', 'shocking', 'disgraceful'
        }

    def extract_entities(self, text: str) -> List[Dict[str, str]]:
        """
        Extracts Named Entities (PERSON, ORG, GPE, DATE, MONEY, PERCENT, etc.) from text.
        """
        if not text:
            return []

        entities = []
        if self.nlp:
            doc = self.nlp(text)
            for ent in doc.ents:
                entities.append({
                    "text": ent.text,
                    "label": ent.label_,
                    "start_char": ent.start_char,
                    "end_char": ent.end_char
                })
        else:
            # Fallback regex entity recognizer for capitalized proper nouns & numbers
            # Capitalized words (Person / Org / GPE approximation)
            cap_matches = re.finditer(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
            for match in cap_matches:
                entities.append({
                    "text": match.group(),
                    "label": "PROPER_NOUN",
                    "start_char": match.start(),
                    "end_char": match.end()
                })

            # Numbers / Percentages / Currency
            num_matches = re.finditer(r'\b(?:\$\d+(?:\.\d+)?|\d+(?:\.\d+)?%|\d{4})\b', text)
            for match in num_matches:
                entities.append({
                    "text": match.group(),
                    "label": "NUMERIC",
                    "start_char": match.start(),
                    "end_char": match.end()
                })

        return entities

    def _assess_verifiability(
        self, 
        sentence: str, 
        entities: List[Dict[str, str]], 
        assertion_verbs: List[str], 
        has_numbers: bool
    ) -> float:
        """Computes a score from 0.0 to 1.0 representing how verifiable a claim is."""
        score = 0.2  # Base score

        # Presence of Named Entities increases verifiability
        if entities:
            score += min(0.3, len(entities) * 0.1)

        # Presence of reporting/assertion verbs
        if assertion_verbs:
            score += 0.25

        # Numerical/statistical data
        if has_numbers:
            score += 0.25

        # Subjective opinion penalty
        sentence_lower = sentence.lower()
        if any(op in sentence_lower for op in self.opinion_indicators):
            score -= 0.3

        return round(max(0.0, min(1.0, score)), 2)

    def extract_claims(self, text: str) -> List[Claim]:
        """
        Extracts verifiable claims from text with metadata and verifiability scores.
        """
        sentences = self.preprocessor.tokenize_sentences(text)
        claims = []
        claim_counter = 1

        for idx, sentence in enumerate(sentences):
            if len(sentence.split()) < 4:
                continue  # Skip short sentence fragments

            sentence_entities = self.extract_entities(sentence)

            # Find assertion verbs
            words = [w.lower() for w in re.findall(r'\b[a-zA-Z]+\b', sentence)]
            found_verbs = [v for v in words if v in self.reporting_verbs]

            # Check for numbers / percentages / dates
            has_numbers = bool(re.search(r'\b\d+(?:\.\d+)?%?|\$\d+\b', sentence))

            # Determine claim type
            if has_numbers:
                claim_type = "STATISTICAL_CLAIM"
            elif found_verbs:
                claim_type = "REPORTED_CLAIM"
            elif sentence_entities:
                claim_type = "FACTUAL_ASSERTION"
            else:
                claim_type = "GENERAL_STATEMENT"

            verifiability = self._assess_verifiability(sentence, sentence_entities, found_verbs, has_numbers)

            # Filter for meaningful claims (verifiability threshold >= 0.35 or contains entities/verbs/numbers)
            if verifiability >= 0.35 or found_verbs or sentence_entities or has_numbers:
                claims.append(Claim(
                    claim_id=claim_counter,
                    text=sentence,
                    sentence_index=idx,
                    claim_type=claim_type,
                    verifiability_score=verifiability,
                    entities=sentence_entities,
                    assertion_verbs=found_verbs,
                    has_numerical_data=has_numbers
                ))
                claim_counter += 1

        return claims

    def process_text_claims(self, text: str) -> Dict[str, Any]:
        """
        Executes claim extraction and NER, returning structured summary.
        """
        all_entities = self.extract_entities(text)
        claims = self.extract_claims(text)

        # Entity breakdown summary
        entity_summary = {}
        for ent in all_entities:
            label = ent['label']
            entity_summary[label] = entity_summary.get(label, 0) + 1

        return {
            "total_entities": len(all_entities),
            "entity_summary": entity_summary,
            "entities": all_entities,
            "total_claims": len(claims),
            "claims": [asdict(c) for c in claims]
        }
