from .models import (
    DatasetMetadata,
    HazardEnvelopeSummary,
    RegionSummary,
    ReplaySummary,
    ScenarioManifest,
)

SCENARIOS = (
    ScenarioManifest(
        scenario_id="tokushima-synthetic-mvp",
        scenario_version="0.1.0",
        title="徳島市 地震・津波トレーニング（synthetic fixture）",
        region=RegionSummary(
            name="徳島市 MVP synthetic fixture",
            center_lat=34.0703,
            center_lon=134.5548,
        ),
        hazards=["earthquake", "tsunami"],
        production=False,
        hazard_envelopes=[
            HazardEnvelopeSummary(
                field_id="synthetic-max-water-depth",
                quantity="max_water_depth",
                unit="m",
                evidence_class="illustrative",
            )
        ],
        replay=ReplaySummary(
            replay_type="illustrative",
            authoritative_for_fatality=False,
            description=(
                "MVP integration fixture. This replay is illustrative and must not be treated "
                "as an official Tokushima tsunami time series."
            ),
        ),
    ),
)

DATASETS = (
    DatasetMetadata(
        dataset_id="tokushima-max-inundation-metadata",
        title="津波浸水想定（最大浸水深）",
        publisher="徳島県",
        source_reference="https://opendata.pref.tokushima.lg.jp/dataset/5110.html",
        source_version="2025-11",
        evidence_class="official_published",
        production_usable=True,
        blocking_actions=[],
    ),
    DatasetMetadata(
        dataset_id="tokushima-arrival-30cm-metadata",
        title="浸水深30cm到達時間",
        publisher="徳島県",
        source_reference="https://opendata.pref.tokushima.lg.jp/dataset/5145.html",
        source_version="2026-03",
        evidence_class="official_published",
        production_usable=False,
        blocking_actions=["createDerivative"],
    ),
    DatasetMetadata(
        dataset_id="synthetic-mvp-fixture",
        title="Synthetic MVP integration fixture",
        publisher="disaster_sim test fixture",
        source_reference="repository://data/fixtures",
        source_version="0.1.0",
        evidence_class="illustrative",
        production_usable=False,
        blocking_actions=["productionSource"],
    ),
)
