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


def stable_hash(payload: object) -> str:
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:24]


def create_run(request: RunCreateRequest) -> RunCreateResponse:
    canonical_request = request.model_dump(mode="json")
    return RunCreateResponse(
        run_id=stable_hash(canonical_request),
        identity=RunIdentity(
            scenario_id=request.scenario_id,
            scenario_version="1.0.0-fixture",
            dataset_versions={"application-owned-fixture": "1.0.0"},
            artifact_versions={"web": "0.1.0"},
            engine_version="0.1.0",
            seed=request.seed,
            initial_conditions_hash=stable_hash(
                {
                    "location": request.location.model_dump(mode="json"),
                    "timeOfDay": request.time_of_day,
                }
            ),
            player_profile_hash=stable_hash({"person": request.person}),
            preparedness_profile_hash=stable_hash(
                request.preparedness.model_dump(mode="json")
            ),
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
