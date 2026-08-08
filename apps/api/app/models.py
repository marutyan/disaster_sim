from typing import Literal

from pydantic import BaseModel, ConfigDict, model_validator
from pydantic.alias_generators import to_camel

EvidenceClass = Literal[
    "official_published",
    "official_derived",
    "app_derived",
    "app_simulated",
    "illustrative",
]
ReplayType = Literal["official_timeseries", "app_physics", "app_derived", "illustrative"]
SpatialRepresentation = Literal["raster", "vector", "mesh", "building", "road_edge", "point"]
TemporalRepresentation = Literal["static", "time_series", "event_series"]


class ContractModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )


class TimeRange(ContractModel):
    start: int
    end: int


class ScenarioManifest(ContractModel):
    scenario_id: str
    scenario_version: str
    title: str
    region_id: str
    hazard_types: list[str]
    dataset_versions: dict[str, str]
    artifact_version: str
    default_seed: str
    supported_time_range_ms: TimeRange


class Field(ContractModel):
    field_id: str
    quantity: str
    unit: str
    spatial_representation: SpatialRepresentation
    temporal_representation: TemporalRepresentation
    resolution_meters: float | None = None
    crs: str
    artifact_uri: str | None = None
    provenance_id: str


class ReplayEvent(ContractModel):
    event_id: str
    time_ms: int
    kind: str
    evidence_class: EvidenceClass
    provenance_id: str


class ScenarioReplay(ContractModel):
    replay_type: ReplayType
    fields: list[Field]
    events: list[ReplayEvent]


class ProvenanceRecord(ContractModel):
    provenance_id: str
    evidence_class: EvidenceClass
    source_dataset_ids: list[str]
    description: str


class Scenario(ContractModel):
    manifest: ScenarioManifest
    hazard_envelopes: list[Field]
    replay: ScenarioReplay
    provenance: list[ProvenanceRecord]

    @model_validator(mode="after")
    def require_static_hazard_envelopes(self) -> "Scenario":
        if any(field.temporal_representation != "static" for field in self.hazard_envelopes):
            raise ValueError("hazard envelopes must use static temporal representation")
        return self
