# disaster_sim

平時に災害を疑似体験し、発災後の避難開始・経路選択・避難先選択・事前防災の効果を学ぶためのWebアプリケーションです。

> **Training only:** 本アプリは平時の防災訓練用です。実災害時の避難ナビゲーションではありません。実際の災害時は気象庁・自治体等の公的情報を優先してください。

## Current status

- Phase: **Fixture MVP implementation candidate**
- Initial target concept: 徳島市の一部地域
- Initial hazard: 南海トラフ巨大地震 → 津波
- Implemented training flow: Landing → Setup → Simulation → Review → Retry
- Default view: FPS; TPS / 2D Map切替あり
- Simulation time: 発災約1分前から、Pause / 1x / 2x / 5x / 10x
- Backend: FastAPI scenario / run / review API
- Data used by current MVP: **application-owned synthetic fixtures only**

正式仕様は [`docs/spec/README.md`](docs/spec/README.md)、実装計画は [`docs/superpowers/plans/2026-08-09-disaster-sim-mvp.md`](docs/superpowers/plans/2026-08-09-disaster-sim-mvp.md) を参照してください。

## What the fixture MVP demonstrates

- versioned local setup/profile storage
- deterministic fixed-tick simulation core
- seeded PRNG for authoritative stochastic decisions
- earthquake phase and reduced movement during shaking
- synthetic building-damage / NPC-evacuation / road-obstruction visualization
- MapLibre 2D mode using inline application-owned GeoJSON only
- Cesium geodetic→local coordinate conversion + Three.js 3D renderer
- illustrative tsunami replay with explicit evidence labeling
- multi-axis review: official status / hazard evidence / training outcome / injury
- same-seed and new-seed retry
- strict Rights Gate and provenance/evidence contracts
- FastAPI run registration and review endpoint with local/offline fallback

## Critical scientific boundary

Current MVP geometry and hazard shapes are intentionally synthetic. They are **not** an official prediction for the displayed coordinates.

The project distinguishes:

```text
official_published
official_derived
app_derived
app_simulated
illustrative
```

Hazard Envelope and Replay are different concepts. In particular, an `illustrative` tsunami replay **must not** by itself determine an exact arrival time, survival, death, or authoritative safe/unsafe result.

The currently identified Tokushima 30 cm tsunami arrival-time dataset is not used in the fixture/production pipeline because the accepted project policy blocks data whose required derivative/redistribution rights are not clearly ALLOW under the intended processing.

## Rights policy

Production artifacts require every necessary action to be explicitly `ALLOW`.

```text
UNKNOWN          -> BLOCK
DENY             -> BLOCK
required N/A     -> BLOCK
ALLOW            -> pass for that action
```

The project does not rely on inquiry, individual permission, or private agreements. Public datasets with ambiguous conditions are not mandatory dependencies.

No external public map tile/geocoder endpoint is hardcoded in the current MVP. Map mode renders local synthetic GeoJSON.

## Architecture

```text
apps/web                 Next.js / React / TypeScript
  ├─ MapLibre            local 2D fixture rendering
  ├─ Cesium              geodetic coordinate conversion
  └─ Three.js            local 3D training visualization

packages/domain          pure deterministic TypeScript domain
  ├─ scenario contracts
  ├─ rights gate
  ├─ seeded RNG
  ├─ fixed-tick simulation
  ├─ mobility / injury
  └─ damage / roads

apps/api                 FastAPI / Pydantic
  ├─ scenario repository
  ├─ run registration
  └─ review evaluation

data/fixtures            application-owned synthetic fixtures
```

PostgreSQL/PostGIS, object storage, rights-verified real GIS ingestion, and HPC-generated time-series fields remain future adapters behind the same Scenario Data Interface.

## Local development

### Requirements

- Node.js 22+
- pnpm 11.12.0
- Python 3.12+

### Web

```bash
corepack enable
corepack prepare pnpm@11.12.0 --activate
pnpm install --no-frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`.

### API

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -e "apps/api[dev]"
uvicorn app.main:app --app-dir apps/api --reload --port 8000
```

API health: `http://localhost:8000/health`.

The web defaults to `http://localhost:8000`. Override with `NEXT_PUBLIC_API_BASE_URL` when necessary.

### Docker Compose

```bash
docker compose up --build
```

- Web: `http://localhost:3000`
- API: `http://localhost:8000`

No secrets are required for the fixture MVP.

## Verification

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build

python -m pip install -e "apps/api[dev]"
ruff check apps/api/app apps/api/tests
pytest apps/api/tests -q
```

GitHub Actions additionally builds the Web/API Docker images. The current acceptance record is [`docs/acceptance/mvp-checklist.md`](docs/acceptance/mvp-checklist.md).

## Deferred — explicitly not faked in the MVP

- rights-verified real Tokushima GIS ingestion and redistribution
- official tsunami arrival-time / time-series water depth / flow velocity
- H100 or other GPU batch tsunami physics
- FEM/DEM building collapse
- production PostGIS / object storage deployment
- full bicycle / vehicle evacuation physics
- account / cloud sync
- mobile full-3D

These are **Deferred, not TBD**. They require a separate Issue, evidence/rights review, implementation and verification before being represented as supported capability.

## Repository policy

- Issue-first
- one Issue = one deliverable/decision unit
- one PR = one deliverable
- commits are kept as reviewable logical units
- squash merge is not assumed
- merge is not performed without explicit approval
- Design Baseline changes require a dedicated Issue
- rights/scientific boundaries may not be weakened silently for implementation convenience
