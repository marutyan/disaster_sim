# 03. Data, Rights, and Provenance Specification

## 1. Purpose

本書は、本システムが利用する地理空間・防災・人口・都市モデル等について、取得、保存、加工、派生物生成、キャッシュ、公開表示、再配布、出典表示、更新、再現性を統一管理するための規則を定義する。

本システムでは「公開されている」ことと「必要な方法で利用できる」ことを同義とみなさない。

## 2. Top-level data policy

### DATA-001

Productionでは、公開情報のみから必要な権利条件を明確に判定できるデータのみ採用する。

### DATA-002

問い合わせ、個別許諾、口頭確認、非公開契約を採用前提にしない。

### DATA-003

必要な権利が1項目でも `UNKNOWN` のデータはProductionで使用しない。

### DATA-004

同一または類似データが複数公開経路で異なるライセンス表記を持つ場合、より都合の良い表記を恣意的に選んではならない。

明確に同一リソースであることと適用条件を確認できない場合は別Datasetとして扱う。

## 3. Dataset registry

全外部データセットをDataset Registryへ登録する。

```ts
interface SourceDataset {
  datasetId: string;
  title: string;
  publisher: string;
  sourceUrl: string;
  publishedAt?: string;
  retrievedAt: string;
  sourceVersion?: string;
  sourceHash?: string;
  originalFormat?: string;
  originalCrs?: string;
  geographicCoverage?: string;
  temporalCoverage?: string;
  rightsPolicyId: string;
  status: "candidate" | "approved" | "blocked" | "retired";
}
```

### DATA-005

`sourceHash` を取得可能なファイルについては、取得時の原データhashを保存する。

### DATA-006

同一URLで内容が更新されるDatasetは、取得日だけでなくhashまたは公開Versionを用いて過去Runを再現可能にする。

## 4. Rights model

権利は単一のLicense文字列ではなく、必要行為ごとに評価する。

```ts
type RightsDecision = "ALLOW" | "DENY" | "UNKNOWN" | "NOT_APPLICABLE";

interface RightsPolicy {
  rightsPolicyId: string;
  licenseLabel?: string;
  licenseUrl?: string;

  fetch: RightsDecision;
  localStore: RightsDecision;
  transform: RightsDecision;
  createDerivative: RightsDecision;
  cacheClientSide: RightsDecision;
  cacheServerSide: RightsDecision;
  redistributeOriginal: RightsDecision;
  redistributeDerivative: RightsDecision;
  publicDisplay: RightsDecision;
  commercialUse: RightsDecision;

  attributionRequired: boolean;
  modificationNoticeRequired: boolean;
  attributionTemplate?: string;

  statutoryRestrictions: string[];
  notes: string[];
  reviewedAt: string;
  evidenceUrls: string[];
}
```

## 5. Rights Gate

### RIGHTS-001

Artifact生成前にRights Gateを通過しなければならない。

### RIGHTS-002

Publish前にも再度Rights Gateを評価する。

### RIGHTS-003

今回実行する処理に必要な権利のみを判定するのではなく、生成Artifactの実際の配布方法まで含めて評価する。

例:

```text
server-side transform only
  → transform + localStore が必要

browser PWA cache
  → cacheClientSide が必要

public derived tiles
  → createDerivative + redistributeDerivative + publicDisplay が必要
```

### RIGHTS-004

必要項目に `UNKNOWN` または `DENY` が存在する場合:

```text
artifact.productionEligible = false
```

とする。

## 6. Rights review workflow

```text
Source discovered
  ↓
Dataset Registry candidate
  ↓
Official terms / license evidence captured
  ↓
Rights Policy filled
  ↓
Rights Gate
  ├─ PASS → ingest allowed
  └─ BLOCK → production ingest prohibited
  ↓
Transform
  ↓
Validation
  ↓
Artifact
  ↓
Publish-time Rights Gate
```

問い合わせによってBLOCKを解消する運用は設けない。

## 7. Processing provenance

原データからArtifactまでの全変換をDAGとして追跡する。

```ts
interface ProcessingStep {
  stepId: string;
  operation: string;
  inputHashes: string[];
  outputHash: string;
  tool: string;
  toolVersion: string;
  parameters: Record<string, unknown>;
  executedAt: string;
}
```

対象例:

- CRS transform
- geometry repair
- clipping
- dissolve
- rasterization
- resampling
- tiling
- quantization
- attribute projection
- schema normalization
- compression

### PROV-001

どの公開画面のHazard Fieldからも、元DatasetおよびProcessing Stepsへ逆参照可能でなければならない。

### PROV-002

変換後データの意味が原データから変化する処理はEvidence Classを再評価する。

## 8. Evidence class

```ts
type EvidenceClass =
  | "official_published"
  | "official_derived"
  | "app_derived"
  | "app_simulated"
  | "illustrative";
```

### 8.1 official_published

公的機関が公表した値・区域・属性を、その意味を保持した状態で使用する。

### 8.2 official_derived

CRS変換、切り出し等、意味を変えずに技術的に導出したデータ。

ただし補間・再サンプリングで表示精度が変わる場合は、その事実をmetadataへ記録する。

### 8.3 app_derived

アプリ独自ルールにより公的情報等から導出した値。

### 8.4 app_simulated

乱数・数理モデル・物理計算により生成した結果。

### 8.5 illustrative

見た目・教育表現のみを目的とし、定量評価に用いない。

## 9. Hazard Envelope

公的な最大危険範囲等はHazard Envelopeとして扱う。

```ts
interface HazardEnvelope {
  envelopeId: string;
  hazardType: string;
  fieldIds: string[];
  sourceScenarioDescription: string;
  evidenceClass: "official_published" | "official_derived";
}
```

### DATA-ENV-001

複数シナリオの最大値を重ねたEnvelopeを、単一の時間発展Scenarioとして扱わない。

### DATA-ENV-002

最大値Envelopeから到達時刻・途中時刻の値を逆算し、公式値として表示しない。

## 10. Replay data

Replay Fieldには出自種別を必須とする。

```ts
type ReplayType =
  | "official_timeseries"
  | "app_physics"
  | "app_derived"
  | "illustrative";
```

### DATA-REP-001

`illustrative` な時間進行を安全性の定量判定へそのまま使ってはならない。

### DATA-REP-002

`official_timeseries` を名乗るには、元データ自体が時系列情報を持ち、Rights GateとValidationを通過している必要がある。

## 11. Field metadata

```ts
interface Field {
  fieldId: string;
  quantity: string;
  unit?: string;
  spatialRepresentation: "raster" | "vector" | "mesh" | "building" | "road_edge" | "point";
  temporalRepresentation: "static" | "time_series" | "event_series";
  resolution?: string;
  crs?: string;
  artifactUri: string;
  evidenceClass: EvidenceClass;
  provenanceIds: string[];
  precisionNotice?: string;
}
```

### DATA-FLD-001

表示UIは必要に応じて `precisionNotice` を提示できなければならない。

## 12. No fabricated precision

例:

250 mメッシュ震度を建物中心点へspatial joinした場合でも、建物単位の精密公式予測になったわけではない。

表示は例えば:

> この地点を含む250 mメッシュの想定

等、元データ解像度を伝えられる設計にする。

### DATA-PREC-001

色分けRendererの連続補間値を、公式が公表した連続値としてTooltipへ表示しない。

## 13. Missing data

### DATA-MISS-001

信頼できるデータが存在しない現象は、`unavailable`, `insufficient_evidence`, `not_modeled` 等で明示する。

### DATA-MISS-002

近隣地域の値・AI推定・見た目の整合だけを理由に穴埋めし、公式情報として扱ってはならない。

### DATA-MISS-003

内部モデルで補完する場合、その結果を公的属性と同じカラムへ書き込んではならない。

## 14. Source attribute state

建物等の属性は、値と出自状態を分離する。

```ts
interface SourcedValue<T> {
  value: T | null;
  state: "observed" | "source_derived" | "sampled_latent" | "unknown";
  provenanceIds: string[];
}
```

`sampled_latent` はユーザーへ実属性として提示しない。

## 15. Attribution

使用DatasetのProvenanceから出典表示を自動生成する。

### ATTR-001

手書きREADMEだけを唯一のAttribution管理にしてはならない。

### ATTR-002

Datasetごとに必要な加工表示・出典文言をRights Policyへ保持する。

### ATTR-003

Scenario詳細画面から、使用Dataset、公開元、Version/取得日、Evidence Classを確認できる設計とする。

## 16. Dataset update policy

更新検知とProduction反映を分離する。

```text
Detected
  → Retrieved
  → Rights checked
  → Parsed
  → Validated
  → Approved
  → Published
```

### DATA-UPD-001

公開元に新Versionが出ても自動で既存Production Scenarioを書き換えない。

### DATA-UPD-002

過去Versionを保持し、既存Runを再現可能にする。

### DATA-UPD-003

新規ScenarioではApproved済み最新版をDefaultにできる。

## 17. Scenario versioning

以下を分離する。

- `scenarioVersion`: シナリオロジック/設定のVersion
- `datasetVersion`: 元データVersion
- `artifactVersion`: 変換Artifact Version
- `engineVersion`: Simulation Engine Version

一つのversion文字列へ統合してはならない。

## 18. Geospatial validation

最低限以下を検査する。

- CRS
- bounds
- geometry validity
- geometry count
- duplicate IDs
- NoData
- attribute type
- attribute range
- expected geographic coverage
- spatial alignment

### GIS-VAL-001

変換後のHazard layerを、元の公式地図/資料と自動・目視の双方で比較する。

## 19. Personal location data

位置情報の処理とプロフィール永続化を分離する。

### PRIV-001

Scenario処理のためサーバーへ `lat/lon` を送信することは可能。

### PRIV-002

その座標が「ユーザーの自宅」であるという意味属性を、デフォルトでサーバーへ永続保存してはならない。

### PRIV-003

保存地点はデフォルトでブラウザローカルに保持する。

### PRIV-004

クラウド同期は明示オプトインとする。

## 20. Research logs

研究用行動ログと通常運用ログを分離する。

研究用途では少なくとも以下を必要とする。

- 明示同意
- 目的説明
- 匿名化/仮名化設計
- 必要最小限の位置精度
- 保存期間方針

同意していないユーザーの自宅・学校等を研究Datasetへ転用しない。

## 21. PWA/cache rights

### RIGHTS-CACHE-001

PWA cacheへ保存するArtifactは `cacheClientSide = ALLOW` を要求する。

### RIGHTS-CACHE-002

サーバーObject Storageへ原データ/変換データを保存する場合は `localStore/cacheServerSide` 等、実際の保存形態に応じた許可を要求する。

## 22. Blocked data handling

Rights GateでBLOCKされたDatasetは、Metadata自体をRegistryへ残してよい。

ただし:

- 原データの自動Production ingest
- 変換Artifact生成
- 公開配信
- Simulation評価への利用

を禁止する。

UI/管理画面ではBlocked reasonを表示可能にする。

## 23. Current rights baseline

具体的なDatasetの採否は [06-source-registry.md](06-source-registry.md) を正とする。

特にMVPでは、徳島県の30 cm浸水到達時間および津波基準水位について、公開リソースがCC BY-NDであるためProduction不採用とする。

このデータを「内部処理ならよいだろう」として隠れて使用することも禁止する。

## 24. Rights and scientific claim coupling

あるDatasetが技術的に取得可能でも、Rights Gateを通らなければ科学的主張の根拠には使用できない。

逆に権利上利用可能でも、目的に対して精度・意味が不十分なら採用しない。

Production採用には少なくとも:

```text
Rights PASS
AND
Semantic suitability PASS
AND
Validation PASS
```

を必要とする。
