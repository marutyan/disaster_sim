import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.models import Scenario

FIXTURE = (
    Path(__file__).resolve().parents[3] / "data" / "fixtures" / "contract-scenario.json"
)


def load_fixture() -> dict[str, object]:
    return json.loads(FIXTURE.read_text(encoding="utf-8"))


def test_shared_golden_scenario_fixture_validates() -> None:
    scenario = Scenario.model_validate(load_fixture())

    assert scenario.manifest.scenario_id == "tokushima-contract-demo"
    assert scenario.replay.replay_type == "illustrative"
    assert scenario.hazard_envelopes[0].temporal_representation == "static"


def test_hazard_envelope_rejects_time_series() -> None:
    raw = load_fixture()
    raw["hazardEnvelopes"][0]["temporalRepresentation"] = "time_series"  # type: ignore[index]

    with pytest.raises(ValidationError):
        Scenario.model_validate(raw)


def test_unknown_evidence_class_is_rejected() -> None:
    raw = load_fixture()
    raw["provenance"][0]["evidenceClass"] = "official-ish"  # type: ignore[index]

    with pytest.raises(ValidationError):
        Scenario.model_validate(raw)
