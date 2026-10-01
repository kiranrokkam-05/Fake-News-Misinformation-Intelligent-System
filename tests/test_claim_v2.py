import json

from backend import nlp_pipeline_v2 as pipeline


def test_v2_artifacts_and_label_mapping():
    bundle = pipeline.load_bundle()
    assert bundle["label_encoder"].classes_.tolist() == ["FALSE", "TRUE"]
    assert len(bundle["label_encoder"].classes_) == 2


def test_v2_preprocessing_preserves_numbers():
    processed = pipeline.preprocess_text("The period is 365.25 days at 0 degrees.")
    assert "365.25" in processed
    assert "0" in processed


def test_v2_prediction_contract_and_probability_sum():
    result = pipeline.analyze("The Earth revolves around the Sun.", pipeline.load_bundle())
    assert result["prediction"] in {"TRUE", "FALSE"}
    assert set(result["class_probabilities"]) == {"FALSE", "TRUE"}
    assert abs(sum(result["class_probabilities"].values()) - 1.0) < 0.001
    assert result["model"] == "binary_claim_classifier_v2"


def test_v2_true_and_false_examples_are_model_predictions():
    bundle = pipeline.load_bundle()
    true_result = pipeline.analyze("The Moon orbits the Earth.", bundle)
    false_result = pipeline.analyze(
        "The Sun revolves around the Earth once every 24 hours.", bundle
    )
    assert true_result["prediction"] in {"TRUE", "FALSE"}
    assert false_result["prediction"] in {"TRUE", "FALSE"}


def test_v2_metrics_are_binary_and_have_split_sizes():
    metrics = json.loads(pipeline.METRICS_PATH.read_text(encoding="utf-8"))
    assert metrics["classes"] == ["FALSE", "TRUE"]
    assert metrics["train_rows"] > metrics["validation_rows"] > 0
    assert metrics["test_rows"] > 0
    assert metrics["confusion_matrix"]["labels"] == ["FALSE", "TRUE"]
