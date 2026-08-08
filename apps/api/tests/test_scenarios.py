from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_scenarios_returns_application_owned_demo() -> None:
    response = client.get("/api/scenarios")

    assert response.status_code == 200
    payload = response.json()
    assert payload[0]["scenarioId"] == "tokushima-demo"
    assert payload[0]["dataClass"] == "application_owned_fixture"


def test_get_scenario_exposes_evidence_and_fixture_notice() -> None:
    response = client.get("/api/scenarios/tokushima-demo")

    assert response.status_code == 200
    payload = response.json()
    assert payload["manifest"]["scenarioId"] == "tokushima-demo"
    assert payload["replay"]["replayType"] == "illustrative"
    assert payload["hazardEnvelopes"][0]["temporalRepresentation"] == "static"
    assert payload["provenance"][0]["evidenceClass"] == "app_derived"


def test_create_run_returns_reproducible_identity_and_schedule() -> None:
    request = {
        "scenarioId": "tokushima-demo",
        "seed": "integration-seed",
        "person": "adult",
        "timeOfDay": "day",
        "preparedness": {
            "furnitureAnchored": True,
            "flashlight": True,
            "mobileBattery": False,
            "offlineMap": True,
        },
    }

    first = client.post("/api/runs", json=request)
    second = client.post("/api/runs", json=request)

    assert first.status_code == 200
    assert first.json() == second.json()
    assert first.json()["identity"]["seed"] == "integration-seed"
    assert first.json()["schedule"]["startMs"] == -60_000
    assert first.json()["schedule"]["hazardReplayStartMs"] == 300_000


def test_review_does_not_claim_safety_from_illustrative_replay() -> None:
    response = client.post(
        "/api/reviews",
        json={
            "scenarioId": "tokushima-demo",
            "targetReached": True,
            "targetDistanceMeters": 12.5,
            "injuryState": "none",
            "replayEvidenceClass": "illustrative",
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "officialStatus": "unknown",
        "hazardStatus": "insufficient_evidence",
        "simulatedOutcome": "undetermined",
        "trainingGoalReached": True,
        "notes": [
            "Application-owned fixture: no official refuge designation is claimed.",
            "Illustrative tsunami replay is not evidence for time-dependent survival.",
        ],
    }
