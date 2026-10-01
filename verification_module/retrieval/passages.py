import re

from verification_module.models import Passage


def sentence_windows(text: str, title: str, max_passages: int = 3) -> list[Passage]:
    sentences = [
        sentence.strip()
        for sentence in re.split(r"(?<=[.!?])\s+", text or "")
        if sentence.strip()
    ]
    passages = []
    for index in range(0, min(len(sentences), max_passages)):
        window = " ".join(sentences[index : index + 3])
        passages.append(
            Passage(
                text=f"{title}: {window}",
                title=title,
                passage_id=f"{title}:{index}",
            )
        )
    return passages
