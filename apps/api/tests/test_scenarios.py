from fastapi.testclient import TestClient

from disaster_api.main import app

client = TestClient(app)


def test_list_scenarios_returns_versioned_fixture() -> None:
    response = client.get("/api/v1/scenarios")

    assert response.status_code == 200
    payload = response.json()
    assert payload[0]["scenario_id"] == "tokushima-synthetic-mvp"
    assert payload[0]["scenario_version"] == "0.1.0"
    assert payload[0]["region"]["name"] == "徳島市 MVP synthetic fixture"
    assert payload[0]["production"] is False


def test_get_scenario_contains_hazard_and_replay_provenance() -> None:
    response = client.get("/api/v1/scenarios/tokushima-synthetic-mvp")

    assert response.status_code == 200
    payload = response.json()
    assert payload["hazards"] == ["earthquake", "tsunami"]
    assert payload["hazard_envelopes"][0]["evidence_class"] == "illustrative"
    assert payload["replay"]["replay_type"] == "illustrative"
    assert payload["replay"]["authoritative_for_fatality"] is False


def test_unknown_scenario_returns_404() -> None:
    response = client.get("/api/v1/scenarios/missing")

    assert response.status_code == 404
    assert response.json()["detail"] == "Scenario not found"
