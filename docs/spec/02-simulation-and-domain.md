# 02. Simulation and Domain Specification

## 1. Scope

本書は、シミュレーション内で扱う災害・都市・人物・インフラ状態の意味と、MVPで許可するモデル精度を定義する。

基本方針は次の通り。

1. 公的な集計被害モデルを個別建物・個人の確定予測へ読み替えない。
2. 根拠のある確率モデルはseed付きで `app_simulated` として使用できる。
3. 根拠のない確率値を作らない。
4. 見た目の物理表現と評価ロジックを分離する。
5. 将来の高精度物理モデルへ交換できる境界を持つ。

## 2. Simulation clock

描画時刻とSimulation Clockを分離する。

推奨初期値:

```text
simulation_tick = 50 ms
```

Simulation State更新は固定tickを基準とし、Rendererは必要に応じて補間する。

時間倍率はtick消費速度へ作用するが、同一Run Identityの乱数系列を変えてはならない。

## 3. Run identity

主要Simulation結果を一意に識別する入力を以下とする。

```ts
interface ScenarioRunIdentity {
  scenarioId: string;
  scenarioVersion: string;
  datasetVersions: Record<string, string>;
  artifactVersions: Record<string, string>;
  engineVersion: string;
  seed: string;
  initialConditionsHash: string;
  playerProfileHash: string;
  preparednessProfileHash: string;
}
```

## 4. Randomness

乱数はSimulation Engineが管理するPRNGからのみ取得する。

システム時刻、描画frame、`Math.random()` 等を権威的イベントの判定へ直接使用してはならない。

重要な確率イベントはRandom Decision Ledgerへ記録する。

```ts
interface RandomDecision {
  eventId: string;
  stream: string;
  probability?: number;
  draw?: number;
  outcome: string;
  modelId: string;
  modelVersion: string;
}
```

## 5. Earthquake domain

### EQ-001: Seismic intensity

MVPでは徳島県の公表震度分布等、Rights Gateを通過した公的情報をHazard Envelopeとして利用する。

震度データの空間解像度以上に精密な公式主張を行わない。

### EQ-002: Human mobility under shaking

気象庁震度階級関連解説表を、人の行動制約を設計する主要根拠とする。

概念モデル:

| Intensity | Player mobility concept |
|---|---|
| ～5弱 | 通常移動可能。ただし姿勢・環境イベントあり |
| 5強 | 歩行に支障、走行を強く制限 |
| 6弱 | 立位維持困難。通常歩行を大幅制限 |
| 6強～7 | 通常の立位移動を原則許可しない |

これは厳密な生体力学モデルではなく、気象庁の定性的な人間行動記述をゲーム操作制約へ写像した `official_derived` ルールである。

### EQ-003: No invented fall probability

「震度6弱なら63%で転倒」等、一次根拠を持たない個人転倒確率を定義してはならない。

転倒を確率事象として導入する場合は、モデル根拠・対象母集団・適用条件・検証を追加するDesign Changeが必要。

### EQ-004: Camera shake

公的な地震動時系列波形を利用していない場合、カメラ・家具・建物の振動波形は `illustrative` とする。

## 6. Indoor hazard domain

室内では次を表現可能とする。

- 家具移動
- 家具転倒
- 落下物
- ガラス破損
- ドア/通路閉塞
- 床上障害物
- 負傷トリガ

### IN-001: Preparedness effect

家具固定等の事前対策は、根拠がある範囲でイベント発生確率・危険領域・被害程度へ影響させる。

### IN-002: Generic interiors

住宅・学校・オフィス等の汎用内部テンプレートは、対象実在建物の実際の間取りを表すものではない。

テンプレート由来であることをMetadataで追跡する。

### IN-003: Interior realism boundary

家具の細かな剛体挙動はvisual/local physicsであって、公式の被害予測ではない。

## 7. Building domain

### 7.1 Building identity

建物は安定した内部IDを持つ。

```ts
interface BuildingEntity {
  buildingId: string;
  sourceFeatureIds: string[];
  geometryRef: string;
  attributes: BuildingAttributes;
  attributeProvenance: Record<string, string>;
}
```

### 7.2 Building attributes

使用可能な属性例:

- structure type
- construction age class
- floor count
- usage
- geometry
- height

### BL-001: Missing attribute policy

欠損値を真値として埋めて永続化してはならない。

各属性は次の状態を識別可能にする。

```text
observed
source-derived
sampled-latent
unknown
```

`sampled-latent` はモデル内部のMonte Carlo用潜在変数であり、建物の実属性として表示してはならない。

### 7.3 Building damage state

```ts
type BuildingDamageState =
  | "none"
  | "minor"
  | "moderate"
  | "major"
  | "collapse"
  | "unknown";
```

### BL-002: Aggregate-to-individual boundary

徳島県・内閣府等の被害率曲線を個別建物へ適用する場合、その出力は `app_simulated` とする。

「県の想定ではこの建物が倒壊する」と表現してはならない。

### BL-003: Seeded sampling

個別建物のDamage Stateを確率的に決める場合、seed付きサンプリングとし、Random Decision Ledgerへ記録する。

### BL-004: Damage visualization

MVPでは、Damage Stateに応じて破壊プリセットと簡易瓦礫物理を適用できる。

構造FEM/DEM計算を行ったと主張してはならない。

## 8. Debris domain

瓦礫は二種類へ分離する。

### Authoritative debris obstruction

道路閉塞・プレイヤー通行不可等へ影響する権威的状態。

### Visual debris particles

Renderer/physics engineが生成する細かな破片。

権威的道路閉塞を、描画上の偶然の破片位置だけで決めてはならない。

## 9. Road network domain

道路は静的geometryと動的traversal stateを分離する。

```ts
interface RoadEdgeState {
  edgeId: string;
  state: "open" | "degraded" | "blocked";
  traversalCost: number;
  effectiveWidth?: number;
  blockedReasons: RoadBlockReason[];
  provenanceIds: string[];
  validFrom: number;
}
```

Block reason例:

- building_collapse
- debris
- fire
- inundation
- infrastructure_failure
- manual_scenario_event

### ROAD-001

道路閉塞モデルが公的集計被害モデルから個別道路へ確率展開された場合、結果は `app_simulated` とする。

### ROAD-002

根拠がない橋梁崩壊・道路陥没をMVPでランダム生成しない。

### ROAD-003

Routingは時刻依存のDynamic Graphを参照する。

将来の閉塞情報をプレイヤー側Routingへ先読みさせてはならない。

## 10. Pedestrian movement model

個人速度は概念的に以下で構成する。

```text
v = base_speed
  × mobility_factor
  × slope_factor
  × night_factor
  × injury_factor
  × congestion_factor
  × load_factor
  × surface_factor
```

係数はすべて1未満とは限らないが、各係数の意味と根拠をModel Registryへ記録する。

公的な平均避難速度は、個人の固定速度ではなく、集団シミュレーションの校正ターゲットとして利用する。

## 11. NPC domain

### 11.1 NPC profile

NPCは次のような属性を持てる。

- mobility class
- age group
- companion relation
- evacuation behavior profile
- destination preference
- awareness state

### 11.2 Evacuation behavior profiles

例:

- early
- delayed
- very_late
- assisting
- accompanying

公的モデルのカテゴリを使う場合でも、利用できない時刻データ等を補うために独自化した部分は `app_derived` / `app_simulated` とする。

### 11.3 Global route choice

Dynamic Road Graphを使う。

### 11.4 Local collision avoidance

MVP第一候補はORCA/RVO系アルゴリズムとする。

採用ライブラリは、実装時にライセンス・保守状況・ブラウザ統合性を再確認する。

### NPC-001

局所衝突回避アルゴリズムが生成した歩行軌跡を、公的に予測された実際の住民行動として扱わない。

### NPC-002

NPC数を増やすことで見た目だけを改善し、性能目標を破壊してはならない。

MVPでは数十～数百を想定する。

## 12. Crowd state

混雑は道路/空間の実効移動速度へ影響可能とする。

混雑判定・速度低下モデルは、採用時にモデル根拠と単体テストを要求する。

MVPで高密度群集の圧力・将棋倒し等を精密物理として扱わない。

## 13. Injury domain

```ts
type InjuryState =
  | "none"
  | "minor"
  | "severe"
  | "fatal_equivalent";
```

### 13.1 Minor

避難継続可能。必要に応じて速度低下・一部行動制限。

### 13.2 Severe

避難継続可能なケースもあるが、走行不能・大幅速度低下・行動制約等を適用可能。

### 13.3 Fatal equivalent

そのRunは終了する。

直接的な死亡表現を要件としない。

### INJ-001: No HP

連続HPを採用しない。

### INJ-002: No medical diagnosis

骨折・頭部外傷等の具体的傷病名を表示する場合は、イベントとの因果について十分な根拠がある教育説明に限定し、医学的診断として提示してはならない。

### INJ-003: Aggregate fatality rates

人口集団の死者率を `if condition then player dies` の個人判定へ直接転用してはならない。

## 14. Fire domain

### 14.1 Ignition

地震被害、用途、時刻、季節、電気設備、感震ブレーカー等を考慮する公的被害想定モデルを校正根拠として利用可能とする。

個別建物の出火結果は `app_simulated`。

### 14.2 Fire spread

MVPでは以下に限定する。

```text
ignition
  → potential spread cluster
  → app-derived temporal progression
```

詳細な着火時刻を公的値として表示しない。

### FIRE-001

火災Rendererの炎・煙の粒子挙動は `illustrative` とする。

### FIRE-002

延焼時間モデルに根拠がない場合、避難評価へ秒単位の精密さを導入しない。

## 15. Utility domain

対象:

- electricity
- water
- gas
- sewer
- traffic_signal
- railway

```ts
type UtilityStatus = "available" | "degraded" | "unavailable";
```

### UTIL-001

公的集計被害モデルを用いてエリア/クラスタ単位の停止状態を生成する場合、個別施設の公式停止予測として表示しない。

### UTIL-002

停止時刻を裏付ける公的時系列がない場合、アプリ生成時刻は `app_simulated` / `app_derived` とする。

## 16. Communication domain

物理接続性と輻輳を分離する。

```ts
interface CommunicationState {
  physicalConnectivity: "available" | "degraded" | "unavailable";
  congestion: "normal" | "high" | "severe";
}
```

基地局/回線が物理的に生きていても利用困難となる状況を表現できる。

## 17. Device domain

```ts
interface DeviceState {
  batteryRatio: number;
  gpsAvailable: boolean;
  offlineMapAvailable: boolean;
  network: CommunicationState;
  chargingAvailable: boolean;
}
```

## 18. Tsunami domain

### 18.1 Two separate concepts

津波は必ず以下に分離する。

```text
Official Hazard Envelope
Replay Simulation
```

### 18.2 Official Hazard Envelope

MVPで利用可能な公的情報例:

- 最大浸水範囲
- 最大浸水深

これらは `static` な危険包絡として扱う。

### TSU-001

最大浸水深を時刻別水深として読み替えてはならない。

### TSU-002

異なる波源ケース・地域海岸の最大値を結合した包絡情報を、単一波源の物理Replayとして扱ってはならない。

### 18.3 Replay

MVPではRights Gateを通過した時系列流体場がない限り、時間進行は `illustrative` または明示された `app_derived` とする。

### TSU-003

30 cm到達時間等の採用不可データを内部だけで利用してReplay時刻を調整することも禁止する。

### TSU-004

流速場がない場合、車両・家屋・瓦礫の流失を定量物理評価へ使ってはならない。

見た目の漂流は `illustrative` として許可できる。

### TSU-005

「発災後17分43秒で1.27 m」といった精密値は、その地点・時刻の根拠となるデータ/物理計算がない限り表示しない。

## 19. Future tsunami physics

将来、自前物理計算を追加する場合、最低でも以下をFieldとして出力可能な境界を持つ。

```text
water_depth(x, y, t)
flow_velocity_x(x, y, t)
flow_velocity_y(x, y, t)
surface_elevation(x, y, t)
```

出力Evidence Classは `app_simulated` である。

公式最大浸水Envelopeとの比較検証を実施する。

## 20. Evacuation safety domain

避難結果は以下を分離する。

```ts
interface EvacuationOutcome {
  officialStatus: "designated" | "non_designated" | "unknown";
  hazardStatus:
    | "outside_official_envelope"
    | "inside_official_envelope"
    | "insufficient_evidence";
  simulatedOutcome:
    | "safe"
    | "minor_injury"
    | "severe_injury"
    | "fatal_equivalent"
    | "undetermined";
}
```

### SAFE-001

公式指定の有無とシミュレーション上の安全結果を混同しない。

### SAFE-002

Hazard Envelope内の任意建物上階に到達した場合等、利用データだけでは安全判定根拠が不足する場合は `insufficient_evidence` / `undetermined` を利用できる。

無理に成功/失敗へ二値化しない。

## 21. Simulation event log

ユーザー判断と災害イベントを時系列で保存する。

```ts
interface SimulationEvent {
  eventId: string;
  simulationTimeMs: number;
  type: string;
  entityIds: string[];
  payload: unknown;
  evidenceClass: string;
  provenanceIds: string[];
}
```

振り返りはこのEvent Logを主要ソースとして再構成する。

## 22. Authoritative vs non-authoritative state

### Authoritative

結果評価・Replay再現に必要。

- player position at simulation ticks / checkpoints
- building damage state
- injury state
- major NPC decisions
- road traversal state
- utility state
- fire ignition state
- official hazard fields

### Non-authoritative

描画品質用。

- particle positions
- smoke noise
- wave spray
- minor debris transforms
- camera shake noise

後者の非決定性はRun再現性違反ではない。

## 23. Cross-hazard extensibility

将来、洪水・高潮・土砂災害を追加する場合も、以下を再利用する。

- Field abstraction
- Evidence Class
- Scenario Event
- Dynamic Road Graph
- Utility State
- Injury/Movement modifiers
- Hazard Envelope / Replay separation

災害固有実装が既存災害の意味を上書きしてはならない。
