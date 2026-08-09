import json
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, ConfigDict, HttpUrl, model_validator
from pydantic.alias_generators import to_camel

RightsDecision = Literal["ALLOW", "DENY", "UNKNOWN", "NOT_APPLICABLE"]


class ManifestModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )


class SourceRights(ManifestModel):
    fetch: RightsDecision
    local_store: RightsDecision
    transform: RightsDecision
    create_derivative: RightsDecision
    cache_server_side: RightsDecision
    redistribute_derivative: RightsDecision
    public_display: RightsDecision
    commercial_use: RightsDecision
    attribution_required: bool
    modification_notice_required: bool


class PublicSource(ManifestModel):
    source_id: str
    title: str
    publisher: str
    catalog_url: HttpUrl
    dataset_role: Literal[
        "hazard_envelope",
        "seismic_intensity",
        "liquefaction_risk",
        "evacuation_site",
        "blocked_reference",
    ]
    production_enabled: bool
    expected_license_family: str
    expected_formats: list[str]
    rights: SourceRights
    blocked_reason: str | None = None

    @model_validator(mode="after")
    def blocked_source_requires_reason(self) -> "PublicSource":
        if not self.production_enabled and not self.blocked_reason:
            raise ValueError("blocked source requires blocked_reason")
        return self


class PublicSourceManifest(ManifestModel):
    manifest_version: int
    sources: list[PublicSource]


class SourceManifestError(ValueError):
    """Raised when a source is unsafe for the requested production pipeline."""


_REQUIRED_PRODUCTION_ACTIONS = (
    "fetch",
    "local_store",
    "transform",
    "create_derivative",
    "cache_server_side",
    "redistribute_derivative",
    "public_display",
)


def load_source_manifest(path: Path) -> PublicSourceManifest:
    return PublicSourceManifest.model_validate_json(path.read_text(encoding="utf-8"))


def validate_production_source(source: PublicSource) -> None:
    if not source.production_enabled:
        raise SourceManifestError(
            f"{source.source_id}: production_enabled is false: {source.blocked_reason}"
        )
    if source.expected_license_family != "CC-BY":
        raise SourceManifestError(
            f"{source.source_id}: expected license family is not preapproved CC-BY"
        )
    if str(source.catalog_url).startswith("https://") is False:
        raise SourceManifestError(f"{source.source_id}: catalog_url must use HTTPS")

    rights = source.rights.model_dump()
    for action in _REQUIRED_PRODUCTION_ACTIONS:
        if rights[action] != "ALLOW":
            raise SourceManifestError(
                f"{source.source_id}: required right {action} is {rights[action]}"
            )


def manifest_fingerprint(manifest: PublicSourceManifest) -> str:
    """Return canonical JSON used as a stable input to downstream provenance hashing."""
    return json.dumps(
        manifest.model_dump(mode="json", by_alias=True),
        sort_keys=True,
        ensure_ascii=False,
        separators=(",", ":"),
    )
