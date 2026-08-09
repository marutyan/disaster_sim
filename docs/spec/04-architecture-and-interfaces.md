# 04. Architecture and Interfaces Specification

## 1. Architectural goals

本システムのアーキテクチャは以下を満たさなければならない。

1. 公的データ・自前事前計算・演出を同じWeb Clientへ正規化して供給できる。
2. 重い災害計算をブラウザのリアルタイム処理へ依存させない。
3. 地理空間データの大容量配信をタイル/ストリーミングで扱う。
4. Simulation EngineとRendererを分離する。
5. Rights/Provenanceを後付けの文書管理ではなく実行時/Build時の制約にする。
6. Local-first利用を可能にし、アカウントを主要機能の前提にしない。
7. 将来のHPC/GPU Batch PipelineをWeb Backendから独立させる。

## 2. Logical architecture

```text
                    ┌─────────────────────────┐
                    │      Source Datasets     │
                    │ public / licensed data  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Offline Data Pipeline   │
                    │ rights / ingest / GIS   │
                    │ validate / normalize    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    Scenario Artifacts    │
                    │ fields / tiles / meta   │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┴────────────────┐
                ▼                                 ▼
       ┌──────────────────┐              ┌──────────────────┐
       │ PostgreSQL/PostGIS│              │ Object Storage   │
       │ metadata/indexes │              │ large artifacts  │
       └─────────┬────────┘              └─────────┬────────┘
                 │                                  │
                 └──────────────┬───────────────────┘
                                ▼
                    ┌─────────────────────────┐
                    │      FastAPI Backend     │
                    │ scenario / geo / admin  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      Web Frontend        │
                    │ Next.js / React / TS    │
                    │ Cesium / Three / MapLibre│
                    └─────────────────────────┘

Future:
HPC / H100 batch simulator → same Scenario Artifact interface
```

## 3. Repository layout target

実装開始時の推奨構造:

```text
/
├─ apps/
│  ├─ web/                    # Next.js frontend
│  └─ api/                    # FastAPI application
├─ packages/
│  ├─ scenario-schema/        # language-neutral schemas / generated TS/Python models
│  ├─ simulation-core/        # authoritative simulation domain logic
│  ├─ geo-contracts/          # geospatial field/tiling contracts
│  └─ ui/                     # shared UI components where useful
├─ pipelines/
│  ├─ ingest/
│  ├─ rights/
│  ├─ transform/
│  ├─ validation/
│  └─ publish/
├─ data/
│  └─ manifests/              # source metadata only; large data is not committed
├─ docs/
│  ├─ spec/
│  ├─ adr/
│  └─ validation/
├─ infra/
│  ├─ docker/
│  └─ deployment/
└─ tests/
   ├─ fixtures/
   ├─ acceptance/
   └─ reproducibility/
```

この構造は実装計画作成時に既存toolchainとの整合を確認して確定する。

## 4. Frontend stack

暫定採用:

- React
- Next.js
- TypeScript
- CesiumJS
- Three.js
- MapLibre GL JS

### ARCH-FE-001

Rendering engine固有objectをSimulation Domain Stateとして保存してはならない。

Simulation側はRenderer非依存の座標・状態・eventを保持する。

### ARCH-FE-002

FPS/TPS camera stateと地理座標変換を単一のCamera/Coordinate Adapter層へ集約する。

Cesium/Threeそれぞれの独自座標をアプリ全体へ漏らさない。

## 5. Cesium + Three technical gate

CesiumJS + Three.js併用はDesign Baseline上の第一候補だが、実装開始時にTechnical Spikeを必須とする。

評価項目:

- WGS84/ECEF/local frame変換
- floating-point precision
- camera synchronization
- depth buffer interaction
- occlusion
- clipping
- render ordering
- terrain/building alignment
- picking
- resource lifecycle
- GPU memory
- 1080p性能
- FPS/TPS切替

### ARCH-3D-001

Spikeが受入基準を満たさない場合、無理にDual Rendererを維持しない。

代替例:

- Cesium custom primitive/shaderへ災害表現を寄せる
- Three.jsを限定的overlayへ縮小
- renderer境界を再設計

この変更はADRを必要とするが、製品仕様変更とはみなさない。ただしEvidence表示やPerformance要件を満たす必要がある。

## 6. 2D map

MapLibreを2D地図UIの第一候補とする。

責務:

- 地点選択
- 保存地点表示
- 避難候補表示
- Replay route表示
- Hazard overlay表示
- Review comparison

### ARCH-MAP-001

Map Rendererと住所Geocoderを分離する。

特定地図プロバイダに住所文字列を送ることを必須にしない。

## 7. Backend stack

Python + FastAPIを第一候補とする。

理由:

- GIS/Python ecosystemとの親和性
- 将来の科学計算Pipelineとのモデル共有
- API schema生成
- PostGIS連携

Backendは重い津波物理計算を同期HTTP request内で実行してはならない。

## 8. Backend bounded contexts

### Scenario API

- Scenario manifest取得
- Run初期化
- Scenario metadata
- Version resolution

### Geospatial API

- region metadata
- facility lookup
- field metadata
-必要な軽量spatial query

大規模Raster/3D tile payload自体はObject Storage/CDNから配信可能とする。

### Save/Profile API

- opt-in cloud save
- scenario progress
- replay metadata

個人地点ラベルは明示同期時のみ扱う。

### Admin API

- Dataset Registry
- Rights Policy
- Artifact status
- Validation results
- Scenario lifecycle
- Publication

## 9. Database

PostgreSQL + PostGISを採用する。

用途:

- Dataset metadata
- Rights metadata
- Provenance graph references
- Scenario manifest metadata
- Facilities
- Spatial indexes
- Publication state
- User cloud-save metadata

### ARCH-DB-001

大規模3D Tiles・Raster・Replay binaryをRDB large object中心に保存しない。

## 10. Object storage

S3互換Object Storageを想定する。

用途:

- 3D Tiles
- COG/raster tiles
- PMTiles等
- precomputed Scenario chunks
- Replay chunks
- Validation artifacts

Artifact URIはcontent/versionを明示できる構造とする。

可変URL上書きだけで過去Runを壊さない。

## 11. Scenario manifest

```ts
interface ScenarioManifest {
  scenarioId: string;
  scenarioVersion: string;
  title: string;
  regionId: string;
  hazardTypes: string[];
  datasetVersions: Record<string, string>;
  artifactVersions: Record<string, string>;
  engineCompatibility: string;
  defaultSeed?: string;
  supportedSimulationRange: {
    startMs: number;
    endMs: number;
  };
  fieldIds: string[];
  replayId?: string;
  attributionSetId: string;
  publishedAt: string;
}
```

### ARCH-SCN-001

Scenario Manifestは外部URLに依存するだけの薄いポインタではなく、Run再現に必要なVersion参照を固定する。

## 12. Scenario data interface

```ts
interface ScenarioData {
  manifest: ScenarioManifest;
  geography: GeographyDescriptor;
  hazardEnvelopes: HazardEnvelope[];
  replay?: ReplayDescriptor;
  infrastructure: InfrastructureDescriptor;
  evacuation: EvacuationDescriptor;
  population: PopulationDescriptor;
  provenanceIndex: ProvenanceIndex;
}
```

## 13. Replay descriptor

```ts
interface ReplayDescriptor {
  replayId: string;
  replayType: "official_timeseries" | "app_physics" | "app_derived" | "illustrative";
  timeOrigin: string;
  fieldIds: string[];
  eventStreamRefs: string[];
  limitations: string[];
}
```

## 14. Geography descriptor

```ts
interface GeographyDescriptor {
  regionId: string;
  simulationArea: GeoPolygonRef;
  contextArea: GeoPolygonRef;
  terrainRefs: string[];
  buildingRefs: string[];
  roadGraphRef: string;
  coordinateReference: string;
}
```

`simulationArea` と `contextArea` を分離する。

## 15. Simulation area vs context area

### Simulation area

- high LOD
- player movement
- NPC
- dynamic road state
- building damage
- local physics
- authoritative collision

### Context area

- lower LOD
- distant city context
- background hazards
- non-authoritative visual context

### ARCH-AREA-001

行政界をそのままSimulation Areaとして採用する必要はない。

## 16. Simulation core boundary

Simulation Coreは以下の入力を受け取る。

```text
Scenario Data
+ initial conditions
+ player profile
+ preparedness profile
+ seed
+ authoritative user actions
```

出力:

```text
authoritative state snapshots
+ simulation events
+ random decision ledger
+ outcome
```

Rendererのframe eventをSimulation Core inputにしない。

## 17. Renderer boundary

RendererはSimulation Stateを視覚化する。

Rendererが独自に生成する煙・飛沫等は原則non-authoritative。

### ARCH-REN-001

Rendererだけで発生したvisual eventを、Simulation結果評価へ逆流させてはならない。

局所physicsを評価へ使う場合は、そのphysics component自体をSimulation Coreのauthoritative subsystemとして明示する。

## 18. Event sourcing / snapshots

Run全体の再現を効率化するため、以下を併用可能とする。

- deterministic initial state
- authoritative event log
- periodic snapshots
- user action log

### ARCH-RPL-001

Replayは画面録画動画を正本にしない。

正本は状態/Event Logとし、Review UIはそこから再構成する。

## 19. Save format

Saveは最低限以下を固定する。

```ts
interface SavePoint {
  runIdentity: ScenarioRunIdentity;
  simulationTimeMs: number;
  authoritativeStateRef: string;
  eventCursor: string;
  decisionLedgerCursor: string;
  createdAt: string;
}
```

## 20. API versioning

Scenario/Data schemaは明示Versionを持つ。

breaking changeは:

- schema major version更新
- migration strategy
- old scenario compatibility decision

を必要とする。

## 21. Offline / PWA

PWAを採用する。

### Offline candidate data

- UI shell
- training instructions
- rights-approved scenario manifest
- rights-approved map/hazard cache
- save state

### ARCH-OFF-001

開始済みScenarioは、必要Artifactを事前取得済みであれば通信断後も可能な限り継続できる設計とする。

### ARCH-OFF-002

Rights Policyでclient cacheが許可されていないArtifactをService Worker等へ保存してはならない。

## 22. Authentication

MVP主要利用にAuthenticationを要求しない。

将来:

- cloud sync
- school assignment
- admin

等に認証を導入できる。

## 23. Admin workflow

```text
Dataset candidate
  → rights reviewed
  → ingested
  → validated
  → artifact generated
  → scenario assembled
  → scenario validated
  → approved
  → published
```

Scenario lifecycle:

```text
Draft → Validated → Approved → Published → Retired
```

Publishedを直接編集せず、新Versionを作る。

## 24. Address geocoding

デジタル庁ABR等、Rights Gateを通過した住所基盤を第一候補とする。

自前/サーバーGeocoderを利用可能な境界を持ち、住所文字列を第三者へ送信することを必須にしない。

## 25. Tile/streaming policy

全徳島市を高LODで初期ロードしない。

- camera proximity
- simulation area
- expected route neighborhood

等に基づく段階ロードを行う。

Preloadは未来のhazard stateをユーザーUIへ漏洩することとは別である。データがclientに存在していても通常UIでは表示を制御する。

## 26. Web workers / WASM

初期はTypeScript/JavaScriptを中心とする。

以下の重い処理はWeb Workerへ分離する。

- local navigation updates
- NPC local simulation
- interpolation
- decoding

WASMはPerformance profilingで必要性が確認された箇所のみ導入する。

「高速そうだから」という理由だけで初期からWASM化しない。

## 27. Future HPC pipeline

H100等のGPU計算資源をWeb Backendへ常駐させない。

```text
Input scientific datasets
  ↓
HPC job manifest
  ↓
Batch physics simulator
  ↓
Validation
  ↓
Scenario Field normalization
  ↓
Object Storage
  ↓
Scenario Manifest publication
```

### ARCH-HPC-001

HPC Outputも通常のField/Replay/Provenance Interfaceへ正規化する。

### ARCH-HPC-002

Web Clientは「公式データ由来」か「H100自前物理計算」かによって別アプリを必要としない。

Evidence ClassとReplay Typeで区別する。

## 28. Future physics outputs

例:

```text
water_depth(x,y,t)
flow_velocity_x(x,y,t)
flow_velocity_y(x,y,t)
surface_elevation(x,y,t)
ground_motion(x,y,t)
```

これらはartifact chunk/tileとして時間・空間分割可能な形式を採用する。

## 29. Deployment

Dockerでローカル再現可能な構成を要求する。

Productionはクラウド/ホスティング環境へ展開可能とする。

環境固有設定をコードへ埋め込まない。

## 30. Secret policy

- secret/token/private keyをRepositoryへ保存しない
- `.env` をcommitしない
- secret値をログ/Replay/Provenanceへ含めない

## 31. Observability

最低限以下を構造化ログ/metricとして取得可能にする。

- scenario load failures
- artifact version mismatch
- rights gate block
- validation failures
- client performance
- simulation deterministic hash mismatch
- API latency/error

ユーザーの精密位置を不要にObservabilityへ記録しない。

## 32. Architecture decisions requiring ADR

少なくとも以下は実装時にADR対象とする。

- Cesium + Three integration result
- road graph source/generation
- authoritative local physics engine
- schema serialization format
- deterministic PRNG choice
- large replay storage format
- deployment architecture
- auth provider（導入時）
