from fastapi.testclient import TestClient

from disaster_api.main import app

client = TestClient(app)


def test_dataset_list_exposes_rights_and_production_status() -> None:
    response = client.get("/api/v1/datasets")

    assert response.status_code == 200
    payload = response.json()
    by_id = {item["dataset_id"]: item for item in payload}

    allowed = by_id["tokushima-max-inundation-metadata"]
    assert allowed["publisher"] == "徳島県"
    assert allowed["production_usable"] is True
    assert allowed["evidence_class"] == "official_published"

    blocked = by_id["tokushima-arrival-30cm-metadata"]
    assert blocked["production_usable"] is False
    assert "createDerivative" in blocked["blocking_actions"]


def test_dataset_endpoint_never_marks_synthetic_fixture_as_official() -> None:
    response = client.get("/api/v1/datasets")
    payload = response.json()
    fixture = next(item for item in payload if item["dataset_id"] == "synthetic-mvp-fixture")

    assert fixture["production_usable"] is False
    assert fixture["evidence_class"] == "illustrative"
    assert fixture["publisher"] == "disaster_sim test fixture"
