from pathlib import Path

import pytest

from app.ingestion.manifest import (
    SourceManifestError,
    load_source_manifest,
    validate_production_source,
)

ROOT = Path(__file__).resolve().parents[3]


def test_tokushima_public_manifest_contains_only_preapproved_production_sources() -> None:
    manifest = load_source_manifest(ROOT / "data" / "sources" / "tokushima-public.json")

    production = [source for source in manifest.sources if source.production_enabled]
    assert {source.source_id for source in production} == {
        "tokushima-tsunami-max-inundation",
        "tokushima-nankai-seismic-intensity",
        "tokushima-liquefaction-risk",
        "tokushima-emergency-evacuation-sites",
    }
    for source in production:
        validate_production_source(source)
        assert source.expected_license in {"CC-BY-4.0", "CC-BY-2.1-JP"}
        assert source.catalog_url.startswith("https://opendata.pref.tokushima.lg.jp/")


def test_by_nd_source_is_never_production_enabled() -> None:
    manifest = load_source_manifest(ROOT / "data" / "sources" / "tokushima-public.json")
    arrival = next(
        source
        for source in manifest.sources
        if source.source_id == "tokushima-tsunami-30cm-arrival-time"
    )

    assert arrival.production_enabled is False
    with pytest.raises(SourceManifestError, match="production_enabled"):
        validate_production_source(arrival)


def test_production_source_rejects_unknown_or_denied_rights() -> None:
    manifest = load_source_manifest(ROOT / "data" / "sources" / "tokushima-public.json")
    source = next(source for source in manifest.sources if source.production_enabled)

    unknown = source.model_copy(
        update={"rights": source.rights.model_copy(update={"transform": "UNKNOWN"})}
    )
    with pytest.raises(SourceManifestError, match="transform"):
        validate_production_source(unknown)

    denied = source.model_copy(
        update={"rights": source.rights.model_copy(update={"public_display": "DENY"})}
    )
    with pytest.raises(SourceManifestError, match="public_display"):
        validate_production_source(denied)
