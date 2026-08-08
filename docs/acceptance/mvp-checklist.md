# MVP Acceptance Checklist

**Target branch:** `6-mvp-integration`  
**Scope:** application-owned fixtureによるMVP完成判定。実公的GIS ingestionはDeferred。

## Functional flow

- [ ] Landing → Setup → Simulation → Review → Retry routes build successfully.
- [ ] Setup is persisted locally with a versioned schema.
- [ ] Simulation starts at approximately T-60s and supports Pause/1x/2x/5x/10x.
- [ ] FPS/TPS/Map modes are selectable.
- [ ] Map mode uses only application-owned inline GeoJSON; no external tile endpoint is required.
- [ ] 3D mode loads Cesium coordinate conversion and Three.js renderer lazily.
- [ ] Shaking constrains movement.
- [ ] Synthetic building damage, NPC evacuation and road obstruction are visible after the event.
- [ ] Tsunami Replay is visibly labeled `illustrative` and does not itself change injury/survival outcome.
- [ ] Review separates official status, hazard evidence and simulated/training outcome.
- [ ] Same-seed and new-seed retry actions are available.

## Data / rights / science

- [ ] Rights Gate rejects required `UNKNOWN`, `DENY`, and required `NOT_APPLICABLE` decisions.
- [ ] Hazard Envelope is static in the shared contract.
- [ ] `official_published / official_derived / app_derived / app_simulated / illustrative` are distinct.
- [ ] No Tokushima 30cm tsunami arrival-time BY-ND data is present in fixtures/artifacts.
- [ ] No external map/geocoder endpoint is hardcoded.
- [ ] Application-owned fixture notice is visible in setup/simulation/review.
- [ ] No HP-based injury system exists.
- [ ] Authoritative simulation uses explicit seeded RNG rather than `Math.random()`.

## Verification

| Check | Status | Evidence |
|---|---|---|
| Web format/lint | PENDING | GitHub Actions |
| Web typecheck | PENDING | GitHub Actions |
| Domain/Web tests | PENDING | GitHub Actions |
| Next.js build | PENDING | GitHub Actions |
| API ruff | PENDING | GitHub Actions |
| API pytest | PENDING | GitHub Actions |
| API scenario/run/review tests | PENDING | GitHub Actions |
| Docker image build | PENDING | GitHub Actions/manual |
| Browser screenshot/interaction QA | BLOCKED | Browser/simulator tool is not available in this ChatGPT environment |

## Deferred — not blockers for this fixture MVP

- Rights-verified real Tokushima GIS ingestion and redistribution pipeline.
- Official tsunami arrival-time/time-series fields.
- Production PostGIS/Object Storage.
- Full bicycle/vehicle evacuation.
- Mobile full-3D.
- User accounts/cloud sync.
- H100 batch physics execution.
