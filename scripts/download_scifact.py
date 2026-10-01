"""Download the official SciFact JSONL evaluation files."""

from pathlib import Path
import io
import tarfile
from urllib.request import urlopen


ARCHIVE_URL = "https://scifact.s3-us-west-2.amazonaws.com/release/latest/data.tar.gz"
FILES = {"corpus.jsonl", "claims_train.jsonl", "claims_dev.jsonl", "claims_test.jsonl"}


def main() -> None:
    destination = Path(__file__).resolve().parents[1] / "data" / "eval" / "scifact"
    destination.mkdir(parents=True, exist_ok=True)
    with urlopen(ARCHIVE_URL, timeout=60) as response:
        archive = tarfile.open(fileobj=io.BytesIO(response.read()), mode="r:gz")
        members = [
            member
            for member in archive.getmembers()
            if Path(member.name).name in FILES and member.isfile()
        ]
        if {Path(member.name).name for member in members} != FILES:
            raise RuntimeError("SciFact archive did not contain all expected JSONL files")
        for member in members:
            name = Path(member.name).name
            target = destination / name
            with archive.extractfile(member) as source:
                target.write_bytes(source.read())
            print(f"Downloaded {name}: {target.stat().st_size} bytes")


if __name__ == "__main__":
    main()
