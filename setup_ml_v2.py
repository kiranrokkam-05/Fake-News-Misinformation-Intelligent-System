"""Train the versioned FEVER-based claim classifier."""

from backend.nlp_pipeline_v2 import TRAIN_DATA_PATH, TEST_DATA_PATH, train_model


def ensure_dataset():
    missing = [str(path) for path in (TRAIN_DATA_PATH, TEST_DATA_PATH) if not path.exists()]
    if missing:
        raise FileNotFoundError(
            "Download FEVER-derived train.jsonl and dev.jsonl into data/fever before training: "
            + ", ".join(missing)
        )


if __name__ == "__main__":
    ensure_dataset()
    metrics = train_model()
    print("Training complete")
    print(f"Usable samples: {metrics['total_usable_samples']}")
    print(f"Test accuracy: {metrics['accuracy']:.4f}")
