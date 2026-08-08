# 06. Source and Model Registry

**Review baseline:** 2026-08-09

この文書は、Design Baseline策定時点で確認した主要な外部ソース候補と、Production採否の初期判定を記録する。

重要: ここで `candidate` とされるDatasetは、実ファイル取得時のResource metadata、実際の利用条件、Schema、Rights Gate、Validationを通過するまでProduction Approvedではない。

問い合わせ・個別許諾によって採用可能性を上げる運用は行わない。

## 1. Status vocabulary

- **APPROVED-CANDIDATE**: 公開ページ上の条件からMVP採用候補。実Resource検証後にApprovedへ昇格可能。
- **BLOCKED**: 現Design BaselineではProduction不採用。
- **REFERENCE-ONLY**: モデル・UI説明等の根拠として参照するが、Scenario Artifactの元Datasetとして直接配布しない。
- **DEFERRED**: 将来再評価。MVP依存にしない。

## 2. Tokushima tsunami maximum inundation depth

### Registry

- ID: `tokushima-tsunami-max-depth-r7`
- Title: 津波浸水想定（津波浸水深）（SHP）
- Publisher: 徳島県
- URL: https://opendata.pref.tokushima.lg.jp/dataset/5110.html
- Page creation date: 2025-09-12
- Page update date: 2025-11-06
- Page license indication: CC BY
- Status: **APPROVED-CANDIDATE**

### Intended use

- Official Hazard Envelope
- 最大浸水域
- 最大浸水深
- Review overlay
- Hazard status assessment where semantically appropriate

### Mandatory limitations

- 時刻別水深として使用しない。
- 単一波源Replayとみなさない。
- 途中時刻を補間して公式値と表示しない。
- 実SHPの属性・CRSはingestion時に確認する。

### Public evidence

公開ページには、令和7年3月に内閣府が公表した南海トラフ巨大地震被害想定を踏まえ、最新地形等を反映した県独自の最大クラス津波浸水想定である旨と、ResourceのCC BY表示がある。

## 3. Tokushima 30 cm inundation arrival time

### Registry

- ID: `tokushima-tsunami-30cm-arrival-2026`
- Title: 浸水深30cm到達時間（SHP）
- Publisher: 徳島県
- URL: https://opendata.pref.tokushima.lg.jp/dataset/5145.html
- Page creation date: 2026-03-09
- Page update date: 2026-03-11
- Page license indication: CC BY-ND
- Status: **BLOCKED**

### Reason

本システムはScenario Artifact生成、座標変換、空間処理、Web向け配信等を必要とする。改変禁止条件が表示されるリソースを、問い合わせや独自解釈によってProduction利用可能と仮定しない。

### Explicit prohibition

- 到達時間をMVP評価へ使用しない。
- 内部だけで隠れて利用しない。
- Replay timing校正へ使用しない。
- 派生tile/artifactを生成しない。

将来、公開条件そのものが明確に変更された場合のみ新Issueで再評価する。

## 4. Tokushima tsunami warning zone / reference water level

### Registry

- ID: `tokushima-tsunami-reference-water-level-2026`
- Title: 津波災害警戒区域（イエローゾーン:基準水位）（SHP）
- Publisher: 徳島県
- URL: https://opendata.pref.tokushima.lg.jp/dataset/5144.html
- Page creation date: 2026-03-09
- Page update date: 2026-03-11
- Page license indication: CC BY-ND
- Status: **BLOCKED**

### Reason

30 cm到達時間と同様、Production Artifact生成に必要な権利が本設計の保守的Rights Policyを満たさないため。

## 5. Tokushima seismic intensity distribution

### Registry

- ID: `tokushima-nankai-seismic-intensity-2026`
- Title: 南海トラフ巨大地震による震度分布図【徳島県想定】(SHP)
- Publisher: 徳島県
- URL: https://opendata.pref.tokushima.lg.jp/dataset/1176.html
- Page update date: 2026-02-04
- Page license indication: CC BY
- Spatial description: 250 m mesh based on average ground data
- Status: **APPROVED-CANDIDATE**

### Intended use

- Official seismic-intensity Hazard Field
- Earthquake behavior-rule lookup
- Scenario Review

### Mandatory limitations

- 個別住宅の精密な公式震度として表示しない。
- 同じメッシュ内でも地質条件により実際の震度が異なり得る旨をprecision metadataへ反映する。
- 建物中心点へのjoinは空間参照であって解像度向上ではない。

## 6. Tokushima liquefaction risk distribution

### Registry

- ID: `tokushima-nankai-liquefaction-2026`
- Title: 南海トラフ巨大地震による液状化危険度分布図【徳島県想定】(SHP)
- Publisher: 徳島県
- URL: https://opendata.pref.tokushima.lg.jp/dataset/1177.html
- Page update date: 2026-02-04
- Page license indication: CC BY
- Spatial description: 250 m mesh based on average ground data
- Status: **APPROVED-CANDIDATE**

### Public category description

公開ページではPL値による危険度区分が示されている。

### Mandatory limitations

- 個別液状化対策が反映されていないことを考慮する。
- 個別宅地単位の確定判定へ使わない。
- MVPでは液状化の詳細な地盤変形物理を自動生成する根拠にはしない。

## 7. Tokushima emergency evacuation places

### Registry

- ID: `tokushima-emergency-evacuation-places`
- Title: 緊急避難場所 (徳島県)
- Publisher: 徳島県
- URL: https://opendata.pref.tokushima.lg.jp/dataset/487.html
- Page license indication: CC BY for listed CSV resources
- Status: **APPROVED-CANDIDATE**

### Public characteristics

公開ページでは、緊急避難場所は災害種別ごとに分けられている。津波用CSVおよび現在時点データへの外部CSVリンクが掲載され、CC BY表示が確認できる。

### Intended use

- Official evacuation candidate points
- Disaster-type filtering
- Review/official-status evaluation

### Mandatory limitations

- 詳細な施設安全性をCSVにない情報から推定して公式属性として付与しない。
- 市Webページ上の詳細情報を無断でスクレイピングし、canonical DBへ複製することを前提にしない。

## 8. Tokushima population by town and age

### Registry

- ID: `tokushima-city-resident-population`
- Title: 徳島市の町丁別年齢階層別住民基本台帳人口
- Publisher: 徳島市 / 徳島県Open Data portal
- URL: https://opendata.pref.tokushima.lg.jp/dataset/4768.html
- Update pattern: monthly, values for the first day of the month
- Latest observed at review: 令和8年7月1日現在
- Page/resource license indication: CC BY
- Status: **APPROVED-CANDIDATE**

### Intended use

- Residential/night population prior
- Age-distribution calibration
- NPC population model validation

### Mandatory limitations

- 昼間人口として直接使用しない。
- 3世帯以下の町丁では年齢別人口非公表という公開上の欠損を補完して公式値扱いしない。
- NPC一人一人を実在住民として扱わない。

## 9. PLATEAU 3D city model

### Registry

- ID: `plateau-tokushima-city-2023`
- Candidate title: 徳島市 3D都市モデル 2023年度
- Publisher/copyright: relevant local government; distributed through Project PLATEAU / G Spatial Information Center
- PLATEAU site policy: https://www.mlit.go.jp/plateau/site-policy/
- PLATEAU start guide: https://www.mlit.go.jp/plateau/start-guide/
- Dataset candidate URL: https://www.geospatial.jp/ckan/dataset/plateau-36201-tokushima-shi-2023
- Status: **APPROVED-CANDIDATE, RESOURCE-LEVEL REVIEW REQUIRED**

### Public rights baseline

PLATEAU公式サイトでは、G空間情報センターで公開する3D都市モデルを含むコンテンツについて、特記がなければPDL1.0準拠の利用条件が示されている。またStart Guideでは各種オープンライセンスにより商用利用を含め利用可能と説明されている。

### Intended use

- Building geometry
- City context
- Candidate road geometry
- Candidate terrain
- Building attribute inspection

### Mandatory pre-production checks

実Resourceごとに:

- license metadata
- attribution
- modification notice
- statutory restrictions
- LOD coverage
- CityGML schema version
- building attribute presence rate
- road/terrain coverage

を確認する。

### Mandatory limitations

- PLATEAU規格上存在可能な属性が徳島市データに必ず埋まっていると仮定しない。
- 築年・構造種別の充足率を実ファイルで測定するまで、建物Damage Model入力が揃う前提を置かない。

## 10. Digital Agency Address Base Registry

### Registry

- ID: `digital-agency-abr`
- Title: アドレス・ベース・レジストリ
- Publisher: デジタル庁
- Terms: https://www.digital.go.jp/policies/base_registry_address_tos
- Terms last updated at review: 2026-05-29
- Default stated framework: PDL1.0 unless otherwise indicated
- Status: **APPROVED-CANDIDATE**

### Intended use

- Address normalization/geocoding source candidate
- Self-hosted/local geocoder dataset candidate

### Mandatory requirements

- 出典表示
- 加工時の必要表示をRights Policyへ反映
- 実際に利用するResource単位の条件確認

### UX limitation

番地等の精度が不足する場合、ユーザーによる地図ピン修正を許可する。

## 11. JMA seismic intensity explanatory table

### Registry

- ID: `jma-seismic-intensity-explanation`
- Title: 気象庁震度階級関連解説表
- Publisher: 気象庁
- URL: https://www.jma.go.jp/jma/kishou/know/shindo/kaisetsu.html
- Status: **REFERENCE-ONLY / MODEL RULE EVIDENCE**

### Intended use

- 震度別の人の行動制約設計
- 家具・屋外状況の教育説明

### Important semantic note

気象庁自身が、解説表はある震度が観測された場合の周辺現象・被害の目安であり、現象から震度を決定するものではない旨を示している。

本システムでも、解説表を精密な生体力学確率モデルへ変換しない。

## 12. PLATEAU technical specifications

### Registry

- ID: `plateau-handbooks`
- Publisher: 国土交通省 Project PLATEAU
- URL: https://www.mlit.go.jp/plateau/libraries/handbooks/
- Review status: 2026 versions exist, including 3D都市モデル標準製品仕様書 第5.1版
- Status: **REFERENCE-ONLY / IMPLEMENTATION EVIDENCE**

### Intended use

- CityGML interpretation
- LOD semantics
- data conversion design
- disaster visualization implementation guidance

## 13. Candidate technical libraries

Technical libraries are not yet dependency-approved. Actual version/license must be pinned during implementation.

### CesiumJS

Purpose: geospatial 3D / 3D Tiles / terrain.

Status: architecture candidate.

Requirement: current official docs/license review before dependency commit.

### Three.js

Purpose: local hazard visual effects / local 3D objects.

Status: architecture candidate subject to Technical Spike.

### MapLibre GL JS

Purpose: 2D map renderer.

Status: architecture candidate.

### ORCA/RVO implementation

Purpose: NPC local collision avoidance.

Status: algorithm candidate; actual package/repository/license and browser performance must be reviewed before adoption.

## 14. Blocked / excluded source classes

Productionで原則使用しない:

- license表示が不明なダウンロード
-利用規約本文へ到達できず必要権利を確認できないDataset
- 問い合わせによる許諾を前提とするDataset
- 個別契約を必要とするDataset
- 市町村通常WebページのHTMLをcanonical open-data DBとして無断複製する手法
- 同一内容に見える別公開経路の有利なLicenseだけを根拠なく選択する手法

## 15. Source review checklist

新Datasetを追加するIssueでは最低限以下を記載する。

```text
[ ] official source URL
[ ] publisher
[ ] resource URL / identifier
[ ] published/updated date if available
[ ] format
[ ] spatial/temporal coverage
[ ] license label
[ ] license evidence URL
[ ] transformation permission
[ ] derivative redistribution permission
[ ] server cache permission
[ ] client cache permission
[ ] public display permission
[ ] attribution requirement
[ ] modification notice requirement
[ ] statutory restrictions
[ ] semantic suitability
[ ] source precision/resolution
[ ] known limitations
[ ] planned validation
```

一項目でもProductionに必要な権利が不明ならBLOCKする。

## 16. Registry change policy

この文書の `APPROVED-CANDIDATE` は永続保証ではない。

実装時、Dataset更新時、利用方法変更時にRights/semantic reviewを再実施する。

特に:

- Browser cacheを追加する
- public derived tilesを追加する
- commercial deploymentを変更する
- source Resourceを差し替える

場合はRights Gateの必要行為集合が変化する可能性があるため再評価する。
