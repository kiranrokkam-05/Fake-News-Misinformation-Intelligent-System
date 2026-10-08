from backend.app import app
from pathlib import Path


def test_v1_live_and_metadata_routes():
    client = app.test_client()
    assert client.get("/api/v1/health/live").status_code == 200
    assert client.get("/api/v1/version").get_json()["api_version"] == "v1"
    assert client.get("/api/v1/models").status_code == 200


def test_v1_validation_and_content_type_errors():
    client = app.test_client()
    assert client.post("/api/v1/verify", data="not-json").status_code == 415
    response = client.post("/api/v1/verify", json={"claim": "x"})
    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "validation_error"


def test_legacy_analyze_is_marked_as_non_evidence_baseline():
    client = app.test_client()
    response = client.post(
        "/api/analyze",
        json={"text": "The Moon orbits the Earth."},
    )
    assert response.status_code == 200
    assert "not evidence-based" in response.get_json()["warning"]


def test_verify_accepts_recent_news_window():
    client = app.test_client()
    response = client.post(
        "/api/v1/verify",
        json={
            "claim": "The Moon orbits the Earth.",
            "options": {"recent_window_hours": 4},
        },
    )
    assert response.status_code == 200
    assert response.get_json()["recency"]["window_hours"] == 4


def test_frontend_uses_canonical_api_without_inner_html():
    frontend = Path("frontend/app.js").read_text(encoding="utf-8")
    assert '"/api/v1/verify"' in frontend
    assert "innerHTML" not in frontend
