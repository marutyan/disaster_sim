import hashlib
import json

from app.models import (
    ReviewRequest,
    ReviewResponse,
    RunCreateRequest,
    RunCreateResponse,
    RunIdentity,
    RunSchedule,
)

DEFAULT_SCHEDULE = RunSchedule(
    start_ms=-60_000,
    shaking_start_ms=0,
    shaking_end_ms=60_000,
    hazard_replay_start_ms=300_000,
    resolve_at_ms=900_000,
)


def create_run(request: RunCreateRequest) -> RunCreateResponse:
    canonical = json.dumps(request.model_dump(mode="json"), sort_keys=True, separators=(",", ":"))
    run_id = hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:24]
    return RunCreateResponse(
        run_id=run_id,
        identity=RunIdentity(
            scenario_id=request.scenario_id,
            scenario_version="1.0.0-fixture",
            dataset_versions={"application-owned-fixture": "1.0.0"},
            artifact_versions={"web": "0.1.0"},
            engine_version="0.1.0",
            seed=request.seed,
            initial_conditions_hash=f"{request.time_of_day}:{request.person}",
            player_profile_hash=request.person,
            preparedness_profile_hash=hashlib.sha256(
                json.dumps(
                    request.preparedness.model_dump(mode="json"),
                    sort_keys=True,
                    separators=(",", ":"),
                ).encode("utf-8")
            ).hexdigest()[:24],
        ),
        schedule=DEFAULT_SCHEDULE,
    )


def review_run(request: ReviewRequest) -> ReviewResponse:
    notes = ["Application-owned fixture: no official refuge designation is claimed."]
    if request.replay_evidence_class == "illustrative":
        notes.append(
            "Illustrative tsunami replay is not evidence for time-dependent survival."
        )
        hazard_status = "insufficient_evidence"
        simulated_outcome = "undetermined"
    else:
        hazard_status = "insufficient_evidence"
        simulated_outcome = {
            "none": "undetermined",
            "minor": "minor_injury",
            "severe": "severe_injury",
            "fatal_equivalent": "fatal_equivalent",
        }[request.injury_state]

    return ReviewResponse(
        official_status="unknown",
        hazard_status=hazard_status,
        simulated_outcome=simulated_outcome,
        training_goal_reached=request.target_reached,
        notes=notes,
    )
