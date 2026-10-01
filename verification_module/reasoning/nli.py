from dataclasses import dataclass


class ModelUnavailable(RuntimeError):
    """Raised when the configured NLI model cannot be loaded."""


@dataclass
class NLIModel:
    model: object
    tokenizer: object
    labels: dict[int, str]

    def score(self, premise: str, hypothesis: str):
        import torch

        inputs = self.tokenizer(
            premise,
            hypothesis,
            return_tensors="pt",
            truncation=True,
            max_length=512,
        )
        with torch.inference_mode():
            logits = self.model(**inputs).logits
            probabilities = torch.softmax(logits, dim=-1)[0].tolist()
        scores = {"entailment": 0.0, "neutral": 0.0, "contradiction": 0.0}
        for index, probability in enumerate(probabilities):
            label = self.labels.get(index, "").lower()
            if "entail" in label:
                scores["entailment"] = probability
            elif "contrad" in label:
                scores["contradiction"] = probability
            elif "neutral" in label:
                scores["neutral"] = probability
        return scores

    def score_batch(self, premises: list[str], hypotheses: list[str]) -> list[dict[str, float]]:
        import torch

        inputs = self.tokenizer(
            premises,
            hypotheses,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True,
        )
        with torch.inference_mode():
            logits = self.model(**inputs).logits
            probabilities = torch.softmax(logits, dim=-1).tolist()
        results = []
        for row in probabilities:
            scores = {"entailment": 0.0, "neutral": 0.0, "contradiction": 0.0}
            for index, probability in enumerate(row):
                label = self.labels.get(index, "").lower()
                if "entail" in label:
                    scores["entailment"] = probability
                elif "contrad" in label:
                    scores["contradiction"] = probability
                elif "neutral" in label:
                    scores["neutral"] = probability
            results.append(scores)
        return results


def load_nli_model(model_name: str = "MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli") -> NLIModel:
    try:
        from transformers import AutoModelForSequenceClassification, AutoTokenizer

        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSequenceClassification.from_pretrained(model_name)
        model.eval()
        labels = {
            int(index): str(label)
            for index, label in model.config.id2label.items()
        }
        return NLIModel(model=model, tokenizer=tokenizer, labels=labels)
    except Exception as exc:
        raise ModelUnavailable(
            f"Unable to load NLI model '{model_name}': {exc}"
        ) from exc
