from typing import Literal

from pydantic import BaseModel, ConfigDict

EvidenceClass = Literal[
    "official_published",
    "official_derived",
    "app_derived",
    "app_simulated",
    "illustrative",
]

ReplayType = Literal["official_timeseries", "app_physics", "app_derived", "illustrative"]
HazardType = Literal["earthquake", "tsunami", "flood", "landslide", "storm_surge"]


class FrozenModel(BaseModel):
    model_config = ConfigDict(frozen=True)


class RegionSummary(FrozenModel):
    name: str
    center_lat: float
    center_lon: float


class HazardEnvelopeSummary(FrozenModel):
    field_id: str
    quantity: str
    unit: str
    evidence_class: EvidenceClass


class ReplaySummary(FrozenModel):
    replay_type: ReplayType
    authoritative_for_fatality: bool
    description: str


class ScenarioManifest(FrozenModel):
    scenario_id: str
    scenario_version: str
    title: str
    region: RegionSummary
    hazards: list[HazardType]
    production: bool
    hazard_envelopes: list[HazardEnvelopeSummary]
    replay: ReplaySummary


class DatasetMetadata(FrozenModel):
    dataset_id: str
    title: str
    publisher: str
    source_reference: str
    source_version: str
    evidence_class: EvidenceClass
    production_usable: bool
    blocking_actions: list[str]
