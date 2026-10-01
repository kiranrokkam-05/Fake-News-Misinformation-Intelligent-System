import re
import html
import string
from typing import List, Dict, Any, Optional

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import sent_tokenize, word_tokenize

# NLTK resource registry: maps resource name → correct data category path
_NLTK_RESOURCE_PATHS = {
    'punkt':      'tokenizers/punkt',
    'punkt_tab':  'tokenizers/punkt_tab',
    'stopwords':  'corpora/stopwords',
    'wordnet':    'corpora/wordnet',
}

# Ensure mandatory NLTK downloads are available
def _init_nltk_resources():
    for resource, path in _NLTK_RESOURCE_PATHS.items():
        try:
            nltk.data.find(path)
        except LookupError:
            try:
                nltk.download(resource, quiet=True)
            except Exception:
                pass

_init_nltk_resources()


class TextPreprocessor:
    """
    Handles text cleaning, sentence tokenization, word tokenization,
    stopword removal, lemmatization, and text normalization.
    """

    def __init__(self, language: str = 'english'):
        self.language = language
        self.lemmatizer = WordNetLemmatizer()
        try:
            self.stop_words = set(stopwords.words(language))
        except Exception:
            self.stop_words = {
                'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
                'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
                'below', 'between', 'both', 'but', 'by', 'can\'t', 'cannot', 'could', 'couldn\'t',
                'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
                'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
                'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here',
                'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
                'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it',
                'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my',
                'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
                'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t',
                'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some',
                'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves',
                'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
                'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
                'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were',
                'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
                'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would',
                'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours',
                'yourself', 'yourselves'
            }

        # Common contractions mapping
        self.contractions = {
            r"can't": "cannot",
            r"won't": "will not",
            r"n't": " not",
            r"'re": " are",
            r"'s": " is",
            r"'d": " would",
            r"'ll": " will",
            r"'ve": " have",
            r"'m": " am"
        }

    def clean_text(self, text: str) -> str:
        """
        Cleans raw text by stripping HTML, URLs, expanding contractions,
        normalizing whitespace and special characters.
        """
        if not text or not isinstance(text, str):
            return ""

        # Unescape HTML entities
        cleaned = html.unescape(text)

        # Remove HTML tags
        cleaned = re.sub(r'<[^>]+>', ' ', cleaned)

        # Remove URLs
        cleaned = re.sub(r'https?://\S+|www\.\S+', ' ', cleaned)

        # Remove email addresses
        cleaned = re.sub(r'\S+@\S+', ' ', cleaned)

        # Expand common contractions
        for pattern, replacement in self.contractions.items():
            cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)

        # Normalize quotes and dashes
        cleaned = re.sub(r'[“”„]', '"', cleaned)
        cleaned = re.sub(r'[‘’`]', "'", cleaned)
        cleaned = re.sub(r'[—–]', '-', cleaned)

        # Normalize whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()

        return cleaned

    def tokenize_sentences(self, text: str) -> List[str]:
        """Splits clean text into individual sentences."""
        cleaned = self.clean_text(text)
        if not cleaned:
            return []
        try:
            sentences = sent_tokenize(cleaned)
        except Exception:
            # Fallback regex sentence splitter
            sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', cleaned) if s.strip()]
        return sentences

    def tokenize_words(
        self, 
        text: str, 
        lowercase: bool = True, 
        remove_stopwords: bool = False, 
        lemmatize: bool = False
    ) -> List[str]:
        """Tokenizes text into words with optional stopword removal & lemmatization."""
        cleaned = self.clean_text(text)
        if lowercase:
            cleaned = cleaned.lower()

        try:
            tokens = word_tokenize(cleaned)
        except Exception:
            tokens = re.findall(r'\b\w+\b', cleaned)

        # Remove punctuation-only tokens
        tokens = [t for t in tokens if t not in string.punctuation and not re.match(r'^\W+$', t)]

        if remove_stopwords:
            tokens = [t for t in tokens if t.lower() not in self.stop_words]

        if lemmatize:
            tokens = [self.lemmatizer.lemmatize(t) for t in tokens]

        return tokens

    def preprocess_pipeline(self, text: str) -> Dict[str, Any]:
        """
        Executes complete preprocessing pipeline and returns structured metadata.
        """
        cleaned_text = self.clean_text(text)
        sentences = self.tokenize_sentences(cleaned_text)
        words_raw = self.tokenize_words(cleaned_text, lowercase=True, remove_stopwords=False, lemmatize=False)
        words_filtered = self.tokenize_words(cleaned_text, lowercase=True, remove_stopwords=True, lemmatize=True)

        return {
            "raw_text": text,
            "cleaned_text": cleaned_text,
            "sentences": sentences,
            "sentence_count": len(sentences),
            "word_tokens": words_raw,
            "word_count": len(words_raw),
            "processed_tokens": words_filtered,
            "unique_word_count": len(set(words_filtered)),
            "normalized_string": " ".join(words_filtered)
        }
