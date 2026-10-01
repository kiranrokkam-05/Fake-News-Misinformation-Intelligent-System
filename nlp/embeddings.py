import numpy as np
from typing import List, Dict, Any, Union, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .preprocessor import TextPreprocessor


class SemanticSimilarityEngine:
    """
    Computes vector embeddings and semantic similarity scores between text snippets,
    claims, and reference fact checks / knowledge base articles.
    """

    def __init__(self, max_features: int = 5000, ngram_range: tuple = (1, 2)):
        self.preprocessor = TextPreprocessor()
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            ngram_range=ngram_range,
            sublinear_tf=True,
            stop_words='english'
        )
        self._is_fitted = False

    def fit_vectorizer(self, corpus: List[str]) -> None:
        """Fits the TF-IDF vectorizer on a text corpus."""
        cleaned_corpus = [self.preprocessor.clean_text(doc) for doc in corpus if doc]
        if cleaned_corpus:
            self.vectorizer.fit(cleaned_corpus)
            self._is_fitted = True

    def get_embedding(self, text: str) -> np.ndarray:
        """Generates a TF-IDF embedding vector for a given text."""
        cleaned = self.preprocessor.clean_text(text)
        if not self._is_fitted:
            self.fit_vectorizer([cleaned])

        vector = self.vectorizer.transform([cleaned]).toarray()
        return vector[0]

    def compute_cosine_similarity(self, text1: str, text2: str) -> float:
        """Calculates cosine similarity score (0.0 to 1.0) between two text strings."""
        if not text1 or not text2:
            return 0.0

        cleaned1 = self.preprocessor.clean_text(text1)
        cleaned2 = self.preprocessor.clean_text(text2)

        # Fit temporary vectorizer on pair if global vectorizer is unfitted
        if not self._is_fitted:
            temp_vec = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
            try:
                matrix = temp_vec.fit_transform([cleaned1, cleaned2])
                sim = cosine_similarity(matrix[0:1], matrix[1:2])[0][0]
                return round(float(sim), 4)
            except Exception:
                return 0.0

        vec1 = self.vectorizer.transform([cleaned1])
        vec2 = self.vectorizer.transform([cleaned2])
        sim = cosine_similarity(vec1, vec2)[0][0]
        return round(float(sim), 4)

    def find_top_matches(
        self, 
        claim: str, 
        reference_texts: List[str], 
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Finds the top K most semantically similar reference texts for a given claim.
        """
        if not claim or not reference_texts:
            return []

        cleaned_claim = self.preprocessor.clean_text(claim)
        cleaned_refs = [self.preprocessor.clean_text(ref) for ref in reference_texts]

        temp_vec = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
        try:
            all_texts = [cleaned_claim] + cleaned_refs
            matrix = temp_vec.fit_transform(all_texts)
            claim_vec = matrix[0:1]
            ref_vecs = matrix[1:]

            sim_scores = cosine_similarity(claim_vec, ref_vecs)[0]
            
            # Sort by highest similarity
            scored_refs = []
            for idx, score in enumerate(sim_scores):
                scored_refs.append({
                    "reference_index": idx,
                    "reference_text": reference_texts[idx],
                    "similarity_score": round(float(score), 4)
                })

            scored_refs.sort(key=lambda x: x["similarity_score"], reverse=True)
            return scored_refs[:top_k]
        except Exception:
            return []

    def calculate_consensus_score(
        self, 
        claims: List[str], 
        reference_corpus: List[str]
    ) -> Dict[str, Any]:
        """
        Computes overall semantic consensus score between article claims and reference corpus.
        """
        if not claims or not reference_corpus:
            return {
                "overall_consensus_score": 0.0,
                "matched_claims_count": 0,
                "total_claims_count": len(claims),
                "claim_matches": []
            }

        matches = []
        similarity_sum = 0.0
        matched_count = 0

        for claim in claims:
            top_matches = self.find_top_matches(claim, reference_corpus, top_k=1)
            if top_matches:
                best_match = top_matches[0]
                matches.append({
                    "claim": claim,
                    "best_matching_reference": best_match["reference_text"],
                    "similarity_score": best_match["similarity_score"]
                })
                similarity_sum += best_match["similarity_score"]
                if best_match["similarity_score"] >= 0.25:
                    matched_count += 1
            else:
                matches.append({
                    "claim": claim,
                    "best_matching_reference": None,
                    "similarity_score": 0.0
                })

        avg_consensus = similarity_sum / max(1, len(claims))

        return {
            "overall_consensus_score": round(avg_consensus, 4),
            "matched_claims_count": matched_count,
            "total_claims_count": len(claims),
            "consensus_ratio": round(matched_count / max(1, len(claims)), 4),
            "claim_matches": matches
        }
