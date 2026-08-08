# Disaster Simulation Design Baseline

**Version:** 1.0  
**Status:** Approved design baseline / implementation not started  
**Date:** 2026-08-09  
**Tracking:** Issue #1

## 1. Purpose

このディレクトリは、災害疑似体験・防災訓練Webアプリケーションの実装前Design Baselineを定義する。

本仕様の目的は、製品目的、ユーザー体験、災害モデル、科学的主張範囲、データ利用条件、再現性、システム境界、MVP完成条件を固定し、実装中の暗黙的な仕様変更を防ぐことである。

本仕様は「見た目のリアリティ」を定義する資料ではない。最重要なのは、ユーザーに提示する情報の根拠と、アプリ内で生成した結果の意味が追跡可能であることである。

## 2. Document map

| Document | Responsibility |
|---|---|
| [01-product-and-experience.md](01-product-and-experience.md) | 製品目的、対象ユーザー、体験フロー、操作、評価、教育設計 |
| [02-simulation-and-domain.md](02-simulation-and-domain.md) | 地震、建物、NPC、負傷、火災、津波、道路・インフラ等のドメインモデル |
| [03-data-rights-and-provenance.md](03-data-rights-and-provenance.md) | 公的データ、Hazard Envelope / Replay、Provenance、Rights Gate、個人情報 |
| [04-architecture-and-interfaces.md](04-architecture-and-interfaces.md) | Frontend/Backend、Scenario Data Interface、状態管理、永続化、HPC接続 |
| [05-validation-mvp-and-roadmap.md](05-validation-mvp-and-roadmap.md) | 非機能要件、検証、MVP DoD、明示的禁止事項、後続ロードマップ |
| [06-source-registry.md](06-source-registry.md) | 採用・不採用データ候補、ライセンス根拠、一次情報レジストリ |
| [07-resolved-ambiguities.md](07-resolved-ambiguities.md) | セルフレビューで固定した津波・安全判定・時刻・精度・物理の解釈境界 |

## 3. Normative language

- **MUST / 必須**: 満たさない実装は仕様違反。
- **MUST NOT / 禁止**: 実装してはならない。
- **SHOULD / 推奨**: 原則として満たす。逸脱する場合はIssueで理由・影響・検証方法を記録する。
- **MAY / 任意**: 実装上の選択肢。

## 4. Quality priority

品質優先順位は次の順に固定する。

> **データ正確性 > シミュレーション整合性 > 操作性 > 性能 > 見た目**

フォトリアルな表現のために、元データより高い精度を主張したり、公的情報と演出を混同したりしてはならない。

## 5. Evidence classes

重要なHazard Field、Simulation Event、評価根拠は、最低でも以下のいずれかへ分類する。

```text
official_published
  公的機関が直接公表した値・区域・属性

official_derived
  公的情報を、意味を変えない明示的な変換で導出した値

app_derived
  アプリが公的情報等から規則に基づいて導出した値

app_simulated
  確率モデル・数値モデルによりアプリが生成した結果

illustrative
  教育・視覚表現のための演出
```

`confidence` と `evidence_class` は別概念とする。例えば高信頼な自前物理計算であっても `app_simulated` であり、`official_published` にはならない。

## 6. Top-level invariants

### INV-001: No fabricated precision

元データより細かい数値を、公的に確認された精度であるかのように表示してはならない。

### INV-002: Hazard Envelope and Replay are different concepts

最大浸水深等の公的な包絡情報を、単一の物理的に整合した時間発展として扱ってはならない。

### INV-003: Rights UNKNOWN is BLOCKED

Productionで必要な権利が1項目でも `UNKNOWN` のデータはProduction Artifactへ入れてはならない。

### INV-004: No permission dependency

問い合わせ・個別許諾・非公開契約を前提とするデータはProductionの必須依存にしない。

### INV-005: Official guidance wins

本アプリの評価・ヒントと公的避難指針が矛盾する場合、公的指針を優先する。

### INV-006: Authoritative simulation must be reproducible

同一Run Identityで、倒壊対象、主要NPC判断、負傷、道路閉塞、出火等の権威的な離散イベントは同じ結果を返す。

描画粒子・破片の微小な座標まで一致させる必要はない。

### INV-007: Training, not emergency navigation

本システムは平時の防災訓練用である。実災害時の避難判断を本システムへ依存させる設計・表現を禁止する。

### INV-008: Unsupported replay cannot decide survival

`illustrative` なReplayだけを根拠として、時間依存の死亡・負傷・避難成功判定を行ってはならない。詳細は [07-resolved-ambiguities.md](07-resolved-ambiguities.md) に従う。

## 7. Initial baseline

- 初期対象: 日本全国対応可能な設計、MVPは徳島市の一部地域
- MVP第一候補: 渭東地区周辺。ただしGIS評価後にsimulation polygonを決定する
- 初期災害: 南海トラフ巨大地震 → 津波
- 初期ユーザー: 一般住民
- 3D: CesiumJS + Three.jsを暫定採用。Technical Spikeで最終確定
- 2D map: MapLibre
- Frontend: React / Next.js / TypeScript
- Backend: Python / FastAPI
- Database: PostgreSQL + PostGIS
- Large artifacts: Object Storage
- Heavy hazard computation: 事前計算
- Future physics: H100等のGPU Batch/HPCを常駐させず事前計算に利用可能な境界を持つ

## 8. Change control

以下の変更はDesign Baseline変更としてIssueを必須とする。

- 公的データの意味・採用Dataset
- Evidence Classの定義
- Rights Policy
- Hazard Envelope / Replayの境界
- Simulation modelの科学的主張範囲
- 個人情報の保存方針
- MVP Definition of Done
- 実災害時の位置づけ
- Scenario Data Interfaceの互換性を壊す変更

実装都合のみを理由に暗黙変更してはならない。

## 9. Deferred is not TBD

本仕様では、根拠不足や権利上の理由でMVPに含めない項目を「未定」とは扱わない。明示的に **Deferred / Not in MVP** とする。

後続で採用するには、新しい根拠・データ・Rights Gate・検証計画を伴うIssueが必要である。
