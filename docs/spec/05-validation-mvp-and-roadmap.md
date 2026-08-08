# 05. Validation, MVP, and Roadmap Specification

## 1. Purpose

本書は、Design Baselineに対して何を検証すれば実装を受け入れられるか、MVPの完成条件、性能・互換性・再現性・教育品質の基準、およびMVP外機能を定義する。

## 2. Verification status vocabulary

実装・レビュー・受入結果は以下で表現する。

- **PASS**: 要件を満たす証拠を確認済み。
- **FAIL**: 要件を満たさない。
- **NOT RUN**: 実施していない。理由を記録する。
- **BLOCKED**: 外部条件または前提不足により実施不能。残留リスクを記録する。

実施していない検証をPASSと記載してはならない。

## 3. MVP Definition of Done

MVPは、以下の一連の体験が、Rights Gateを通過したデータと再現可能なSimulation Stateに基づいて成立した時点で完成とする。

> 徳島市の選定済みSimulation Areaで開始地点を指定し、南海トラフ巨大地震発生約1分前から訓練を開始する。ユーザーは地震による強い揺れと室内外の被害を体験し、自ら避難開始・経路・避難先を判断する。NPC、道路閉塞、停電等により変化する都市をFPS/TPS/地図モードで移動し、公的最大津波浸水Hazard Envelopeと明確に区別された津波Replayを体験する。最終的に安全・負傷・死亡相当・判定不能のいずれかを得て、地図・タイムライン・簡易3Dリプレイで判断を振り返り、同条件または条件変更で再挑戦できる。

## 4. MVP mandatory capabilities

### Product/UX

- 地点指定
- 住所検索
- 現在地入力
- 保存地点（Local-first）
- Scenario設定
- 発災約1分前開始
- FPS
- TPS
- 地図モード
- Pause / 1x / 2x / 5x / 10x
- 人物プロフィール
- 防災準備プロフィール
- 初回チュートリアル
- 通常/学習支援情報モード

### Hazard simulation

- 公的震度Hazard Field
- 揺れによる行動制約
- 家具/落下物/ガラス等の室内イベント
- 建物Damage State
- 簡易瓦礫表現
- Dynamic Road State
- NPC避難
- 徒歩移動
- 停電等の最低1つ以上のインフラ障害
- 最大津波浸水Hazard Envelope
- Hazard Envelopeと区別された津波Replay
- 負傷状態
- 死亡相当終了

### Education/review

- 多軸評価
- 判断Event Log
- 地図Review
- Timeline Review
- 簡易3D Replay
- 体験中には見えなかった危険情報の事後表示
- Retry
- Rewind/checkpoint
- 同seed比較

### Governance

- Dataset Registry
- Rights Gate
- Provenance
- Evidence Class
- Attribution自動生成
- Versioned Scenario Manifest
- Local Save

## 5. MVP non-blocking features

以下はInterface互換性を妨げない設計を要求するが、MVP完成をブロックしない。

- 自転車の完全な操作/モデル
- 自動車避難
- 学校/自治体向け管理UI
- Cloud Sync
- Replay共有
- 多言語UI
- スマートフォンのフル3D体験

## 6. Explicitly deferred scientific capabilities

以下はMVPに含めない。

- 公的な地点別津波到達時刻の利用（Rights Gateを通過する適切なデータがない限り）
- 公的津波時系列水深場
- 公的津波流速場
- 複数波の物理的忠実再現
- 津波流体による車・家屋・瓦礫の定量漂流評価
- 都市全体のFEM/DEM建物倒壊
- 流体構造連成
- 高密度群集圧/将棋倒しの高精度物理
- 個人医学的傷病予測
- 詳細延焼物理
- 個別橋梁の構造破壊予測

これらを演出として表示する場合は `illustrative` とし、評価ロジックへ暗黙利用しない。

## 7. MVP region selection validation

MVP polygonは第一候補を渭東地区周辺とするが、実装前にGIS評価で確定する。

### Hard constraints

すべて満たすこと。

1. 最大津波浸水想定区域を含む。
2. 住宅地を含む。
3. 複数の避難候補が存在する。
4. 歩行可能な道路Graphを生成できる。
5. PLATEAU等のRights-approved建物データが利用できる。
6. 必須Hazard layersのRights GateがPASS。
7. 各layerを同一空間へ整合可能。

### Weighted score

Hard constraints通過後に以下を評価する。

| Criterion | Weight |
|---|---:|
| データ完全性 | 30 |
| 避難経路・避難先の多様性 | 20 |
| 災害リスクの空間的変化 | 15 |
| 3D都市モデル品質 | 15 |
| 住宅・学校等の都市機能 | 10 |
| 道路Graph品質 | 10 |

被害規模そのものを最大化しない。

### Region artifact

選定結果は以下を保存する。

- polygon geometry
- scoring result
- input dataset versions
- map screenshots/plots
- selection rationale
- validation date

## 8. Source file ingestion validation

実際に採用する各ファイルについて以下を検査する。

- format parse
- encoding
- CRS
- feature count
- unique ID availability
- geometry validity
- empty geometry
- bounds
- attribute names/types
- documented unit
- NoData
- expected categorical values
- unexpected outliers
- source hash

実ファイルのschemaをページ説明だけから推測して実装を固定しない。

## 9. Geospatial transform validation

CRS変換、clip、rasterization、tiling等の後に以下を実施する。

### Automated

- geometry count comparison
- area/length conservation within tolerance
- bounding box
- known-point spatial lookup
- categorical distribution
- numeric min/max/quantiles
- NoData coverage
- topology errors

### Visual/manual

公式Web map/PDF等と複数地点で位置・区分を比較する。

### GIS-ACC-001

Hazard map上の明らかな沿岸/河川/道路との位置ずれを見逃したArtifactはProduction不可。

## 10. Rights validation

各Production Artifactについて:

- Rights Policyが存在
- Evidence URLが存在
- 必要権利がすべてALLOW
- Attribution生成可能
- modification notice要否反映
- client/server cache条件反映

### RIGHTS-ACC-001

`UNKNOWN` が1つでも必要権利に存在すればFAIL。

## 11. Provenance validation

公開Hazard Fieldから逆方向に:

```text
Field
→ Artifact
→ Processing Steps
→ Source Dataset
→ Rights Policy
→ Evidence URL
```

を辿れること。

最低1つの自動integration testでこのtraceを検証する。

## 12. Evidence-label validation

UIで表示される重要情報について、内部Evidence Classとユーザー向け説明が矛盾しないこと。

例:

- `official_published` → 公的想定として出典表示可
- `app_simulated` → アプリが確率生成した個別結果であることを明示
- `illustrative` → 定量的な公式予測であるかのようなラベル禁止

## 13. Determinism validation

同一Run Identityを複数回実行し、最低限以下のhash/結果が一致すること。

- Building Damage State set
- Road blocked/degraded set
- major NPC decision sequence
- injury state transitions
- fire ignition events
- authoritative Outcome
- Random Decision Ledger

### DET-001

描画FPS、モニタrefresh rate、時間倍率変更によって主要結果が変わらないこと。

### DET-002

Web Worker scheduling差によって権威的結果が変わらないこと。

## 14. Probability model validation

確率モデルは単一seedの見た目ではなく、多seedで検証する。

例:

```text
N = sufficiently large seeds
observed simulated damage distribution
vs
expected source-model distribution
```

統計的toleranceをモデルごとに定義する。

### STAT-001

公的集計モデルから個別sampleを生成する実装は、Monte Carlo平均が元モデルの期待値と整合すること。

## 15. NPC validation

検証項目:

- spawn density upper/lower bounds
- destination validity
- blocked edge avoidance
- no impossible teleport
- collision avoidance stability
- average movement speed calibration
- companion behavior
- deterministic route choice under same state

NPCの「人間らしさ」は主観だけで受入れない。少なくとも不可能挙動・Graph違反・再現性を自動検証する。

## 16. Road graph validation

- connected component analysis
- dangling edges
- invalid intersections
- unreachable evacuation sites
- walkability classification
- blocked edge removal
- time-dependent reroute

既知の主要交差点/道路をsampleし、3D geometryとGraphの位置が一致することを確認する。

## 17. Injury validation

MVPでは医学的正確性を数値保証しない。

代わりに:

- 原因Eventが存在
- Injury transitionが許可されたRuleからのみ発生
- 原因なしのrandom injuryがない
- Injury modifierがmovementへ一貫反映
- fatal_equivalent時にRun終了
- Reviewで原因を追跡可能

を要求する。

## 18. Tsunami validation

### Hazard Envelope

- 元最大浸水区域と位置一致
- depth category/value range整合
- source version固定

### Replay

- Replay Type表示が正しい
- illustrative/app-derivedをofficialと表示しない
- Replayが公式最大Envelopeを「公式時系列」として逆算していない

### TSU-ACC-001

MVPで地点別到達時間を表示する場合、その値のEvidence SourceがRights-approvedかつ時間情報を明示的に持たなければFAIL。

現baselineではそのような値をMVP必須にしない。

## 19. Building model validation

- source attribute presence rateを測定
- structure/age/floor等の欠損率をReport化
- unknownを勝手にobservedへ昇格しない
- latent sampled valueをUIへ実属性として表示しない
- damage sampling distribution test

PLATEAU等の実Datasetで属性充足率を確認するまで、全建物に築年/構造が存在する前提を置かない。

## 20. Cesium + Three technical spike acceptance

Spikeは小規模な実PLATEAU/terrain dataで行う。

最低限:

- camera alignment: PASS
- local object geospatial alignment: PASS
- depth/occlusion: acceptable
- FPS/TPS switch: PASS
- memory leak smoke test: PASS
- 1080p representative scene: usable
- picking/interaction: PASS

結果をADRへ保存する。

Dual Rendererが不適切なら代替案へ切り替える。

## 21. Performance targets

Desktop 1080pを初期性能基準とする。

### Target

- average 60 FPS

### Usability floor

- 継続的に30 FPSを下回る状態を避ける

### Stretch

- 1% low >= 30 FPS

性能計測は代表Scenarioと固定条件で再現可能にする。

## 22. Loading targets

具体的秒数は実データ量測定後にPerformance Budgetとして固定する。

ただし以下は即時要件。

- 市全域高LODを初回ロードしない
- progressive loading
- loading状態表示
- main thread長時間blockingを避ける
- Scenario開始に必要な最小Artifactを優先取得

## 23. Browser support

MVP正式対象:

- current Desktop Chrome
- current Desktop Edge

Safari/Firefoxは後続互換性評価とする。

WebGPUをMVP必須条件にしない。

## 24. Offline validation

Rights-approved cacheを用いて開始済みScenarioをネットワーク切断後も可能な範囲で継続する。

検証:

- disconnect after preload
- cached artifact access
- local save
- review generation

サーバー必須機能が失敗した場合は明確なdegraded stateを表示する。

## 25. Accessibility validation

最低限:

- keyboard-only主要UI操作
- rebinding
- subtitles
- camera shake reduction
- FOV option
- TPS/map emergency switch
- text scale
- color-only情報伝達を避ける

## 26. Privacy validation

- Local save時にサーバーへ位置ラベル送信なし
- anonymous core use可能
- cloud syncはopt-in
- analytics/observabilityに精密自宅座標が不要に記録されない
- research consentなしで研究log生成しない

## 27. Safety communication validation

起動・Scenario開始前または明確な位置で以下を伝える。

- 平時の訓練用
- 実災害時は公的情報を優先
- 表示には公的情報とアプリsimulation/演出が混在しうる
- Scenario detailから出典確認可能

## 28. Educational review validation

Review画面で最低限、以下の質問に答えられること。

1. いつ避難を開始したか。
2. どの経路を通ったか。
3. どこで危険に遭遇したか。
4. どの情報をその時点で知っていたか。
5. 事後的には周囲で何が起きていたか。
6. どの行動を変えると結果が変わり得たか。
7. 公的に指定された避難先だったか。
8. 負傷の原因は何だったか。

## 29. Retry comparison validation

同seedで条件を1つ変更した場合、変更していない権威的乱数系列が不用意に全面変化しないPRNG stream設計を推奨する。

例:

```text
building_damage stream
npc_behavior stream
fire stream
injury stream
```

を分離し、家具固定の変更だけで無関係な全建物倒壊sampleが変わることを避ける。

## 30. Source update regression

Dataset Version更新時に:

- spatial diff
- attribute diff
- artifact diff
- scenario acceptance
- attribution diff

を確認する。

既存Scenarioをsilent updateしない。

## 31. Admin publication gate

ScenarioをPublishedにするために必要:

- Rights PASS
- Dataset validation PASS
- Scenario schema PASS
- required provenance PASS
- acceptance test PASS
- known limitations documented

## 32. Explicit production prohibitions

以下はProduction FAIL条件。

1. Rights UNKNOWNデータ利用
2. 問い合わせ前提Datasetへの依存
3. CC BY-ND等の不適切な派生配信
4. 最大浸水Envelopeを公式時系列として表示
5. 複数公式ケースの最大値を単一物理ケースとして扱う
6. 250 m等のデータを一戸単位公式精密値として表示
7. 集団死者率を個人死亡判定へ直接転用
8. 根拠のない転倒率・怪我率・延焼時間
9. LLMによる避難安全判定
10. 自宅属性の無断クラウド保存
11. 指定避難先到着だけで安全成功扱い
12. 演出を公的simulationとしてラベル
13. 実災害時ナビとしての利用誘導
14. deterministic requirementを満たさない確率イベント

## 33. Post-MVP roadmap

### Phase 1: Design/ingestion foundation

- Rights Registry
- Dataset Registry
- Scenario schema
- GIS ingestion/validation
- MVP polygon
- 3D technical spike

### Phase 2: Static city + hazard envelope

- PLATEAU/terrain
- roads
- facilities
- seismic/liquefaction/tsunami envelope
- location UX

### Phase 3: Earthquake interaction

- indoor template
- shaking constraints
- furniture
- building damage
- debris/road state

### Phase 4: Evacuation simulation

- NPC
- dynamic routing
- injury
- utility failures
- FPS/TPS/map

### Phase 5: Review/education

- event log
- timeline
- replay
- evaluation
- retry

### Phase 6: Tsunami replay refinement

- clearly labeled illustrative/app-derived replay
- future physics-compatible fields

### Phase 7: Physics research

- shallow-water simulation
- GPU batch
- H100-class precompute
- velocity fields
- debris/vehicle coupling
- validation against official envelopes

## 34. Future hazard expansion

Architecture targets:

- river flood
- inland flood
- storm surge
- landslide
- multi-hazard interaction

各Hazard追加は新しいField/Modelを加えるが、Evidence/Rights/Provenance/Scenario Interfaceを再利用する。

## 35. Future user study

教育効果評価候補:

- evacuation start timing recognition
- hazard area recognition
- destination choice
- route risk recognition
- preparedness knowledge
- retry improvement

研究実施は製品MVP完成とは分離する。

## 36. Implementation start gate

コード実装へ入る前に以下を完了する。

1. 本Design Baselineをcommitしレビュー可能にする。
2. MVP polygonを実GISで評価・固定する。
3. 実際のDataset manifestを作成する。
4. DatasetごとのRights Gateを記録する。
5. PLATEAU実ファイルの属性充足率を測定する。
6. Cesium + Three Technical Spikeを実施する。
7. Scenario schemaを機械可読形式で固定する。
8. ADR/Repository structureを確定する。
9. 実装計画をIssue/commit単位へ分解する。
10. 検証計画を実行可能なtest listへ落とす。

## 37. Design baseline completion condition

本仕様書群がcommitされても、MVPが完成したことを意味しない。

このcommitの完成条件は:

- 要求が構造化されている
- 公的/独自/演出の境界が明確
- Rightsルールが明確
- MVP DoDが明確
- Deferredが明確
- 実装開始前の検証項目が明確

である。
