# Disaster Simulation MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Design Baseline v1.0を満たす、徳島市を対象とした災害疑似体験MVPを、権利・科学的主張範囲・再現性を維持しながらSetup→Simulation→避難→結果→振り返り→再挑戦まで一連で動作させる。

**Architecture:** pnpm workspaceでNext.js Webと共有TypeScript domainを管理し、FastAPIを独立APIとして配置する。Simulation Coreは描画から分離した決定論的state machineとして実装し、Hazard Envelope、Replay、Rights、Provenanceを共有契約で明示する。実公的データの再配布はMVP実装の前提にせず、Rights Gateを通過したmetadataと権利安全なfixtureで全フローを成立させ、実データingestionは同じinterfaceへ後から差し替える。

**Tech Stack:** Node.js >=22, pnpm 11.12.0, Next.js 16.2.11, React 19.2.7, TypeScript, Vitest, MapLibre GL JS 5.24.x, CesiumJS 1.143.x, Three.js 0.184.x, Python 3.12+, FastAPI 0.136.3, Pydantic v2, pytest.

## Global Constraints

- Design Baseline: `docs/spec/` を規範とし、実装都合で暗黙変更しない。
- Rights Gate: productionで必要な権利が1項目でも `UNKNOWN` ならBLOCKする。
- 問い合わせ・個別許諾を必須依存にしない。
- `official_published / official_derived / app_derived / app_simulated / illustrative` を混同しない。
- Hazard EnvelopeとReplayを分離する。
- `illustrative` 津波Replayだけで時間依存の死亡・避難成功判定を行わない。
- 同一Run Identityで権威的な離散イベントを再現する。
- 実災害時ナビゲーション用途として扱わない。
- PC Chrome/Edgeを初期正式対象とする。
- 品質優先順位: データ正確性 > シミュレーション整合性 > 操作性 > 性能 > 見た目。
- 1 Issue = 1成果、1 PR = 1成果。commitは論理単位で分け、squash mergeを前提にしない。
- merge、削除、force push、履歴改変、権利不明データ投入は自動実行しない。

---

## File Structure

```text
.
├── .github/workflows/ci.yml
├── apps
│   ├── api
│   │   ├── pyproject.toml
│   │   ├── app
│   │   │   ├── __init__.py
│   │   │   ├── main.py
│   │   │   ├── models.py
│   │   │   ├── repositories.py
│   │   │   └── services.py
│   │   └── tests
│   └── web
│       ├── app
│       ├── components
│       ├── lib
│       ├── public
│       ├── package.json
│       └── tsconfig.json
├── packages
│   └── domain
│       ├── src
│       │   ├── contracts.ts
│       │   ├── provenance.ts
│       │   ├── rights.ts
│       │   ├── rng.ts
│       │   ├── simulation.ts
│       │   └── fixtures.ts
│       └── tests
├── data
│   └── fixtures
├── docs
│   ├── spec
│   └── superpowers/plans
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

責務:
- `packages/domain`: ブラウザ/Nodeで共有する純粋な契約・決定論ロジック。DOMやRendererへ依存しない。
- `apps/api`: Scenario Manifest提供、run/review API、将来のPostGIS/Object Storage境界。
- `apps/web`: UI、MapLibre/Cesium/Three renderer adapter、local save。
- `data/fixtures`: 第三者データを複製しない、アプリ自身が作成した権利安全なテストfixture。

---

### Task 1: Foundation and CI (#3)

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `.editorconfig`
- Create: `apps/web/package.json`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/api/pyproject.toml`
- Create: `apps/api/app/__init__.py`
- Create: `apps/api/app/main.py`
- Create: `apps/api/tests/test_health.py`
- Create: `packages/domain/package.json`
- Create: `packages/domain/tsconfig.json`
- Create: `packages/domain/src/index.ts`
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Produces: `GET /health -> {"status":"ok"}`
- Produces: `@disaster-sim/domain` workspace package.

- [ ] **Step 1: Add API failing health test**

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

- [ ] **Step 2: Implement minimal FastAPI health endpoint**

```python
from fastapi import FastAPI

app = FastAPI(title="Disaster Simulation API")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
```

- [ ] **Step 3: Add minimal Next.js shell**

Root page MUST visibly state `防災疑似体験` and `これは平時の訓練用です`.

- [ ] **Step 4: Add CI**

CI MUST execute:

```bash
pnpm install --no-frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
python -m pip install -e 'apps/api[dev]'
pytest apps/api/tests -q
```

- [ ] **Step 5: Commit logical units**

```text
chore(#3): initialize pnpm workspace
feat(#3): add FastAPI health service
ci(#3): add web and api verification
```

---

### Task 2: Shared contracts, Rights Gate, Provenance (#4)

**Files:**
- Create: `packages/domain/src/contracts.ts`
- Create: `packages/domain/src/provenance.ts`
- Create: `packages/domain/src/rights.ts`
- Create: `packages/domain/tests/rights.test.ts`
- Create: `packages/domain/tests/contracts.test.ts`
- Create: `apps/api/app/models.py`
- Create: `apps/api/tests/test_contracts.py`

**Interfaces:**
- Produces: `EvidenceClass`, `RightsDecision`, `RightsPolicy`, `SourceDataset`, `Field`, `ScenarioManifest`, `Scenario`.
- Produces: `evaluateRights(policy, requiredActions): RightsGateResult`.

- [ ] **Step 1: Write Rights Gate tests**

Tests MUST assert:

```text
all required ALLOW -> allowed=true
required UNKNOWN -> allowed=false
required DENY -> allowed=false
NOT_APPLICABLE may pass only when action is not required
```

- [ ] **Step 2: Implement Rights Gate as pure function**

No network, storage, UI, or environment access.

- [ ] **Step 3: Define Evidence classes exactly**

```ts
type EvidenceClass =
  | "official_published"
  | "official_derived"
  | "app_derived"
  | "app_simulated"
  | "illustrative";
```

- [ ] **Step 4: Mirror API models with Pydantic**

Python enums MUST use the same literal string values as TypeScript.

- [ ] **Step 5: Add golden JSON contract fixture**

The same fixture MUST validate in TypeScript and Python tests.

- [ ] **Step 6: Commit**

```text
feat(#4): define scenario and provenance contracts
feat(#4): enforce production rights gate
 test(#4): add cross-language contract fixtures
```

---

### Task 3: Deterministic simulation engine (#4)

**Files:**
- Create: `packages/domain/src/rng.ts`
- Create: `packages/domain/src/simulation.ts`
- Create: `packages/domain/src/fixtures.ts`
- Create: `packages/domain/tests/simulation.test.ts`

**Interfaces:**
- Produces: `createRun(config): SimulationRun`
- Produces: `stepRun(run, deltaMs): SimulationRun`
- Produces: `setTimeScale(run, scale): SimulationRun`
- Produces: `SimulationEvent[]`

- [ ] **Step 1: Write deterministic replay test**

Same Run Identity + same input sequence MUST produce byte-identical authoritative event JSON.

- [ ] **Step 2: Implement seeded PRNG**

PRNG state MUST be explicit and serializable. Authoritative simulation code MUST NOT call `Math.random()` or wall-clock time.

- [ ] **Step 3: Implement fixed 50 ms simulation ticks**

Supported user scales:

```text
0, 1, 2, 5, 10
```

- [ ] **Step 4: Implement MVP state transitions**

Phases:

```text
pre_event -> shaking -> evacuation -> hazard_replay -> resolved
```

- [ ] **Step 5: Encode tsunami safety boundary**

An `illustrative` Replay event MUST NOT alone generate `fatal_equivalent` or authoritative safe/fail timing.

- [ ] **Step 6: Commit**

```text
feat(#4): add deterministic simulation clock and rng
feat(#4): add authoritative event ledger
feat(#4): enforce tsunami replay safety boundary
```

---

### Task 4: MVP domain events (#4)

**Files:**
- Modify: `packages/domain/src/simulation.ts`
- Create: `packages/domain/src/mobility.ts`
- Create: `packages/domain/src/damage.ts`
- Create: `packages/domain/src/roads.ts`
- Create: `packages/domain/tests/mobility.test.ts`
- Create: `packages/domain/tests/damage.test.ts`
- Create: `packages/domain/tests/roads.test.ts`

**Interfaces:**
- Produces: building damage sampling, road state updates, player injury state, mobility factors.

- [ ] **Step 1: Add qualitative seismic mobility rules**

MUST encode the Design Baseline mapping without invented fall probabilities.

- [ ] **Step 2: Add building damage model interface**

Implementation MUST distinguish observed/source-derived/sampled-latent/unknown attributes.

- [ ] **Step 3: Add road state model**

States: `open | degraded | blocked`, with reasons and provenance IDs.

- [ ] **Step 4: Add injury state transitions**

States: `none | minor | severe | fatal_equivalent`; no HP.

- [ ] **Step 5: Commit each domain boundary separately**

---

### Task 5: Scenario API (#6)

**Files:**
- Create: `apps/api/app/repositories.py`
- Create: `apps/api/app/services.py`
- Modify: `apps/api/app/main.py`
- Create: `apps/api/tests/test_scenarios.py`
- Create: `data/fixtures/tokushima-demo-scenario.json`

**Interfaces:**
- `GET /api/scenarios`
- `GET /api/scenarios/{scenario_id}`
- `POST /api/runs`
- `POST /api/reviews`

- [ ] **Step 1: Create application-owned fixture**

Fixture MUST be clearly marked:

```text
region_label = "徳島市デモ領域"
geometry_accuracy = "illustrative_fixture"
not_official_geospatial_data = true
```

It MUST NOT reproduce third-party geometry or BY-ND data.

- [ ] **Step 2: Add repository interface**

Use in-memory/file repository for MVP; interface MUST permit PostGIS/Object Storage implementation later.

- [ ] **Step 3: Add run and review service**

Review MUST distinguish official status, hazard status, simulated outcome.

- [ ] **Step 4: Commit**

---

### Task 6: Web setup flow and local profile (#5)

**Files:**
- Create: `apps/web/app/setup/page.tsx`
- Create: `apps/web/lib/api.ts`
- Create: `apps/web/lib/storage.ts`
- Create: `apps/web/components/setup/*`
- Create: `apps/web/components/common/*`
- Create: `apps/web/tests/storage.test.ts`

**Interfaces:**
- Produces versioned local profile storage.
- Consumes scenario list API.

- [ ] **Step 1: Implement localStorage schema with version**
- [ ] **Step 2: Implement scenario/person/time/preparedness setup**
- [ ] **Step 3: Implement address/location field as UI boundary**

MVP fixture MAY accept lat/lon/manual point. Production geocoder integration is deferred until dataset/license pipeline is available.

- [ ] **Step 4: Commit**

---

### Task 7: Map and 3D renderer adapters (#5)

**Files:**
- Create: `apps/web/components/simulation/MapView.tsx`
- Create: `apps/web/components/simulation/WorldView.tsx`
- Create: `apps/web/components/simulation/CesiumWorld.tsx`
- Create: `apps/web/components/simulation/ThreeEffects.tsx`
- Create: `apps/web/lib/geo.ts`
- Create: `apps/web/lib/renderer-capabilities.ts`

**Interfaces:**
- Produces `RendererMode = fps | tps | map`.
- Renderer consumes Scenario View Model only; MUST NOT own authoritative simulation decisions.

- [ ] **Step 1: Add MapLibre map using a local empty style by default**

Do not hardcode a third-party public tile service whose usage/caching terms are not in Rights Registry.

- [ ] **Step 2: Technical Spike for Cesium + Three**

Use dynamic imports to avoid shipping both renderers before simulation route activation.

- [ ] **Step 3: Provide fallback world**

If WebGL/Cesium integration fails, keep functional map-mode simulation.

- [ ] **Step 4: Commit spike separately from production adapter**

---

### Task 8: Simulation HUD and interaction (#5)

**Files:**
- Create: `apps/web/app/simulate/page.tsx`
- Create: `apps/web/components/simulation/SimulationShell.tsx`
- Create: `apps/web/components/simulation/Hud.tsx`
- Create: `apps/web/components/simulation/TimeControls.tsx`
- Create: `apps/web/components/simulation/PlayerStatus.tsx`
- Create: `apps/web/components/simulation/WarningPanel.tsx`
- Create: `apps/web/components/simulation/ProvenanceBadge.tsx`

- [ ] **Step 1: Implement phase/time display**
- [ ] **Step 2: Implement Pause/1x/2x/5x/10x**
- [ ] **Step 3: Implement FPS/TPS/Map switching**
- [ ] **Step 4: Display Evidence class on inspectable hazard elements**
- [ ] **Step 5: Add training-only banner**
- [ ] **Step 6: Commit**

---

### Task 9: Review and retry experience (#5/#6)

**Files:**
- Create: `apps/web/app/review/page.tsx`
- Create: `apps/web/components/review/Timeline.tsx`
- Create: `apps/web/components/review/RouteComparison.tsx`
- Create: `apps/web/components/review/OutcomePanel.tsx`
- Create: `apps/web/components/review/SourcePanel.tsx`

- [ ] **Step 1: Render authoritative timeline separately from illustrative events**
- [ ] **Step 2: Show multi-axis outcome, never a single 100-point score**
- [ ] **Step 3: Add retry with same seed/change seed/change preparedness**
- [ ] **Step 4: Commit**

---

### Task 10: Accessibility, safety, and persistence (#5/#6)

**Files:**
- Create: `apps/web/components/settings/AccessibilitySettings.tsx`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/lib/storage.ts`

- [ ] **Step 1: Add reduced motion, shake intensity, FOV, text size, subtitle settings**
- [ ] **Step 2: Respect `prefers-reduced-motion`**
- [ ] **Step 3: Ensure local save is default and cloud sync absent from MVP**
- [ ] **Step 4: Commit**

---

### Task 11: Docker/local integration and acceptance (#6)

**Files:**
- Create: `compose.yaml`
- Create: `apps/api/Dockerfile`
- Create: `apps/web/Dockerfile`
- Modify: `README.md`
- Create: `docs/acceptance/mvp-checklist.md`

- [ ] **Step 1: Add non-secret local compose configuration**
- [ ] **Step 2: Document startup**
- [ ] **Step 3: Document scientific/rights boundary**
- [ ] **Step 4: Run CI and fix all failures**
- [ ] **Step 5: Verify setup→simulate→review route build**
- [ ] **Step 6: Record PASS/FAIL/NOT RUN/BLOCKED in acceptance checklist**
- [ ] **Step 7: Commit**

---

### Task 12: Final review and handoff

**Files:**
- Review all changed files.
- Modify only files required to fix validated findings.

- [ ] **Step 1: Compare implementation against every MUST/MUST NOT relevant to MVP**
- [ ] **Step 2: Search for forbidden patterns**

```text
Math.random() in authoritative simulation
unversioned localStorage
hardcoded third-party tile endpoint without rights metadata
"official" labels on app_simulated/illustrative values
Rights UNKNOWN accepted as true
HP / health-points based injury logic
```

- [ ] **Step 3: Run full CI**
- [ ] **Step 4: Create final integration PR without squash**
- [ ] **Step 5: Do not merge without explicit user approval**

---

## Plan Self-Review

### Spec coverage

- Product/UX: Tasks 6, 8, 9, 10.
- Simulation/reproducibility: Tasks 2, 3, 4.
- Rights/provenance: Task 2 and fixture restrictions in Task 5.
- Architecture/interfaces: Tasks 1, 5, 7, 11.
- MVP validation/DoD: Tasks 11, 12.
- Future HPC boundary: Contracts in Task 2 preserve static/time-series Field abstraction; no HPC implementation is required for MVP.

### Intentional deferred items

The following are explicitly Deferred, not TBD:

- Rights-verified real Tokushima data ingestion and redistribution pipeline.
- Official tsunami arrival-time/time-series fields unavailable under accepted Rights policy.
- High-fidelity tsunami physics and H100 batch execution.
- Full bicycle/vehicle evacuation physics.
- Production PostGIS/Object Storage deployment.
- User accounts/cloud sync.
- Mobile full-3D.

These deferred items MUST NOT be silently approximated as official data in the MVP.

### Type consistency

Canonical strings are fixed by Design Baseline. TypeScript and Python contracts must share golden fixture values and CI validation.

### Completion interpretation

For this implementation cycle, "MVP complete" means the full user flow and authoritative simulation/rights boundaries are working with application-owned fixtures. It does **not** mean unavailable or rights-blocked public datasets have been substituted with invented data.
