from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models import (
    ReviewRequest,
    ReviewResponse,
    RunCreateRequest,
    RunCreateResponse,
    Scenario,
)
from app.repositories import FileScenarioRepository, ScenarioNotFoundError
from app.services import create_run, review_run

app = FastAPI(
    title="Disaster Simulation API",
    version="0.1.0",
    description="Training-only API for the disaster simulation MVP.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

repository = FileScenarioRepository()


@app.get("/health")
def health() -> dict[str, str]:
    """Return liveness for local development and orchestration."""
    return {"status": "ok"}


@app.get("/api/scenarios")
def list_scenarios() -> list[dict[str, str]]:
    return [
        {
            "scenarioId": scenario.manifest.scenario_id,
            "title": scenario.manifest.title,
            "dataClass": "application_owned_fixture",
        }
        for scenario in repository.list()
    ]


@app.get("/api/scenarios/{scenario_id}", response_model=Scenario, response_model_by_alias=True)
def get_scenario(scenario_id: str) -> Scenario:
    try:
        return repository.get(scenario_id)
    except ScenarioNotFoundError as error:
        raise HTTPException(status_code=404, detail="scenario not found") from error


@app.post("/api/runs", response_model=RunCreateResponse, response_model_by_alias=True)
def create_run_endpoint(request: RunCreateRequest) -> RunCreateResponse:
    try:
        repository.get(request.scenario_id)
    except ScenarioNotFoundError as error:
        raise HTTPException(status_code=404, detail="scenario not found") from error
    return create_run(request)


@app.post("/api/reviews", response_model=ReviewResponse, response_model_by_alias=True)
def review_run_endpoint(request: ReviewRequest) -> ReviewResponse:
    try:
        repository.get(request.scenario_id)
    except ScenarioNotFoundError as error:
        raise HTTPException(status_code=404, detail="scenario not found") from error
    return review_run(request)
