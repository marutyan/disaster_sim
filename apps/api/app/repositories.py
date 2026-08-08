import json
from pathlib import Path

from app.models import Scenario

ROOT = Path(__file__).resolve().parents[3]
FIXTURE_PATH = ROOT / "data" / "fixtures" / "tokushima-demo-scenario.json"


class ScenarioNotFoundError(KeyError):
    """Raised when a scenario ID is not present in the configured repository."""


class FileScenarioRepository:
    def __init__(self, fixture_path: Path = FIXTURE_PATH) -> None:
        self._fixture_path = fixture_path

    def _load_demo(self) -> Scenario:
        payload = json.loads(self._fixture_path.read_text(encoding="utf-8"))
        return Scenario.model_validate(payload)

    def list(self) -> list[Scenario]:
        return [self._load_demo()]

    def get(self, scenario_id: str) -> Scenario:
        scenario = self._load_demo()
        if scenario.manifest.scenario_id != scenario_id:
            raise ScenarioNotFoundError(scenario_id)
        return scenario
