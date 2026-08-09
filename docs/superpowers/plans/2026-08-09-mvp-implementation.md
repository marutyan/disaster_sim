# Disaster Simulation MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 徳島市を対象とする災害疑似体験WebアプリのMVPを、Rights Gate・Provenance・再現性を維持したまま、地点選択から地震・避難・津波Hazard Envelope・振り返りまで一連で動作する状態にする。

**Architecture:** pnpm workspaceのmonorepoとし、`apps/web` はNext.js/React/TypeScript、`apps/api` はFastAPI、`packages/domain` は共有ドメイン型と決定論的Simulation Coreを担当する。大規模GIS本体はRepositoryへ直接格納せず、MVPではRights Gateを通過したmetadata/fixtureとsynthetic scenario fixtureでシステム境界を実装し、production dataset ingestionは独立pipelineとして接続する。

**Tech Stack:** Node.js 24, pnpm, Next.js, React, TypeScript, Vitest, Playwright, CesiumJS, Three.js, MapLibre GL JS, Python 3.12+, FastAPI, Pydantic v2, pytest, PostgreSQL/PostGIS-ready SQLAlchemy models, GitHub Actions.

## Global Constraints

- データ正確性 > シミュレーション整合性 > 操作性 > 性能 > 見た目。
- Rights GateでProductionに必要な権利が1つでも`UNKNOWN`ならBLOCKする。
- 問い合わせ・個別許諾をProduction必須依存にしない。
- `official_published / official_derived / app_derived / app_simulated / illustrative`を混同しない。
- Hazard EnvelopeとReplayを分離する。
- `illustrative`な津波Replayだけで時間依存の死亡・避難成功判定をしない。
- 同一Run Identityで主要離散イベントを再現する。
- 自宅・学校・職場ラベルは既定でlocal storageのみ。
- 実災害用ナビゲーションとして提供しない。
- squash mergeを使用しない。
- 1 Issue = 1成果、1 PR = 1成果、commitはレビュー可能な論理単位で分割する。

---

## Task 1: Repository foundation and CI

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`, `.editorconfig`
- Create: `apps/web/package.json`, `apps/api/pyproject.toml`, `packages/domain/package.json`
- Create: `.github/workflows/ci.yml`
- Create: `scripts/check-no-secrets.mjs`

**Interfaces:**
- Produces: workspace commands `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`; Python command `pytest apps/api/tests`.

- [ ] Add a CI fixture commit containing tests/config only and verify workflow starts.
- [ ] Add minimal workspace manifests and quality scripts.
- [ ] CI must run web/domain lint, TypeScript typecheck, unit tests, production build, Python ruff/pytest, and secret-pattern check.
- [ ] Commit as `chore(#<issue>): scaffold workspace and CI`.

## Task 2: Shared domain schema and deterministic simulation core

**Files:**
- Create: `packages/domain/src/types.ts`
- Create: `packages/domain/src/prng.ts`
- Create: `packages/domain/src/simulation.ts`
- Test: `packages/domain/src/*.test.ts`

**Interfaces:**
- Produces: `ScenarioRunIdentity`, `EvidenceClass`, `RightsDecision`, `SimulationClock`, `DeterministicRng`, `SimulationEvent`, `SimulationState`.

- [ ] Test that the same seed produces the same random sequence and different seeds diverge.
- [ ] Test Pause/1x/2x/5x/10x clock semantics.
- [ ] Test that authoritative events are stable across render-frame cadence.
- [ ] Implement only behavior required by tests.
- [ ] Commit deterministic PRNG and clock separately.

## Task 3: Rights Gate, Dataset Registry, Provenance

**Files:**
- Create: `packages/domain/src/rights.ts`, `packages/domain/src/provenance.ts`
- Create: `data/registry/datasets.json`
- Test: `packages/domain/src/rights.test.ts`, `packages/domain/src/provenance.test.ts`

**Interfaces:**
- Produces: `evaluateRights(policy, requiredActions)`, `buildAttribution(manifest)`.

- [ ] RED: rights UNKNOWN/DENY blocks Production.
- [ ] GREEN: ALLOW-only policy passes.
- [ ] RED/GREEN: attribution preserves publisher, title, source reference and modification notice.
- [ ] Register only approved metadata fixtures; mark BY-ND datasets blocked.

## Task 4: FastAPI foundation

**Files:**
- Create: `apps/api/src/disaster_api/main.py`
- Create: `apps/api/src/disaster_api/models.py`
- Create: `apps/api/src/disaster_api/routes/scenarios.py`
- Create: `apps/api/src/disaster_api/routes/datasets.py`
- Test: `apps/api/tests/test_health.py`, `test_scenarios.py`, `test_datasets.py`

**Interfaces:**
- `GET /health`
- `GET /api/v1/scenarios`
- `GET /api/v1/scenarios/{id}`
- `GET /api/v1/datasets`

- [ ] Tests first with FastAPI TestClient.
- [ ] Return versioned fixture scenario manifest with provenance/evidence fields.
- [ ] Do not expose blocked datasets as production-usable.

## Task 5: Next.js application shell and design system

**Files:**
- Create: `apps/web/src/app/*`
- Create: `apps/web/src/components/*`
- Create: `apps/web/src/styles/*`
- Test: component tests under `apps/web/src/**/*.test.tsx`

**Interfaces:**
- Routes: `/`, `/setup`, `/simulation`, `/review`, `/about/data`.

- [ ] Build dark disaster-training UI without decorative gradients.
- [ ] Landing page must explicitly state平時訓練用 and not real-time emergency navigation.
- [ ] Implement keyboard-accessible navigation and reduced-motion support.

## Task 6: Location setup and privacy-first local profiles

**Files:**
- Create: `apps/web/src/features/setup/*`
- Create: `apps/web/src/lib/local-profile.ts`
- Test local-only persistence and clear/reset behavior.

**Interfaces:**
- Map click/manual lat-lon fixture entry/current-location permission entry.
- Local labels `home/school/work/custom` must remain browser-local by default.

- [ ] Tests first for local persistence and no network serialization of labels.
- [ ] Add MapLibre map adapter with fallback static coordinate UI when WebGL unavailable.

## Task 7: 3D simulation scene and camera modes

**Files:**
- Create: `apps/web/src/features/simulation/scene/*`
- Create: `apps/web/src/features/simulation/camera/*`
- Create: `apps/web/src/features/simulation/hud/*`

**Interfaces:**
- Modes: `fps`, `tps`, `map`.
- Simulation state comes exclusively from domain core; renderer cannot decide authoritative injury/death/road closure.

- [ ] Create renderer abstraction so Cesium/Three integration can be replaced.
- [ ] Add synthetic city fallback scene for test/development.
- [ ] Camera mode switching must preserve player world position.

## Task 8: Earthquake, indoor, building, road, NPC simulation

**Files:**
- Create domain model modules under `packages/domain/src/models/*`
- Create render adapters in `apps/web/src/features/simulation/models/*`
- Tests for deterministic damage, road closure and NPC routing.

**Interfaces:**
- Earthquake mobility constraints are evidence-tagged.
- Individual building outcome is `app_simulated`.
- NPC local avoidance cannot be described as official behavior prediction.

- [ ] Add seeded building damage state.
- [ ] Add road graph states OPEN/DEGRADED/BLOCKED.
- [ ] Add simple deterministic crowd route planner suitable for MVP fixtures.
- [ ] Add injury state without HP.

## Task 9: Tsunami Hazard Envelope and Replay

**Files:**
- Create: `packages/domain/src/models/tsunami.ts`
- Create: `apps/web/src/features/simulation/tsunami/*`
- Add fixture envelope under `data/fixtures/` explicitly marked synthetic/non-production.

**Interfaces:**
- Envelope: static official/synthetic max-depth class.
- Replay: `illustrative` for MVP unless app physics exists.

- [ ] Tests prohibit using illustrative Replay as authoritative fatality/safe-arrival trigger.
- [ ] Display provenance badge in HUD/review.
- [ ] Maximum depth/envelope can influence retrospective hazard classification only when source evidence permits it.

## Task 10: Evaluation, replay and retry

**Files:**
- Create: `packages/domain/src/evaluation.ts`
- Create: `apps/web/src/features/review/*`

**Interfaces:**
- Multi-axis evaluation: departure timing, route, information check, hazard exposure, injury, destination status.
- Replay timeline and same-seed retry.

- [ ] Tests ensure outcome, official designation and hazard status remain separate.
- [ ] Add event timeline, route summary and provenance details.

## Task 11: Accessibility, PWA and performance hardening

**Files:**
- Create: `apps/web/public/manifest.webmanifest`
- Add accessibility/e2e tests.
- Add performance budgets to CI.

- [ ] Keyboard navigation and focus states.
- [ ] Reduced motion, shake intensity, FOV and audio controls.
- [ ] PWA shell caching must never cache datasets whose client cache right is not ALLOW.

## Task 12: Integrated MVP acceptance and deployment

**Files:**
- Create: `tests/e2e/mvp.spec.ts`
- Create: `docs/acceptance/mvp.md`
- Update: `README.md`

**Interfaces:**
- One flow: setup → 1 minute pre-event → earthquake → evacuation → tsunami envelope/replay → result → review → retry.

- [ ] CI acceptance scenario uses deterministic synthetic fixtures and never claims those fixtures are official Tokushima data.
- [ ] Build must pass from clean checkout.
- [ ] Deploy web preview to Vercel if project connection permits.
- [ ] Record PASS/FAIL/NOT RUN/BLOCKED honestly.
- [ ] Final whole-repository review against `docs/spec/` before completion.
