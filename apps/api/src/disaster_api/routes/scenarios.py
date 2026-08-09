from fastapi import APIRouter, HTTPException

from ..fixtures import SCENARIOS
from ..models import ScenarioManifest

router = APIRouter(prefix="/api/v1/scenarios", tags=["scenarios"])


@router.get("", response_model=list[ScenarioManifest])
def list_scenarios() -> tuple[ScenarioManifest, ...]:
    return SCENARIOS


@router.get("/{scenario_id}", response_model=ScenarioManifest)
def get_scenario(scenario_id: str) -> ScenarioManifest:
    for scenario in SCENARIOS:
        if scenario.scenario_id == scenario_id:
            return scenario
    raise HTTPException(status_code=404, detail="Scenario not found")
