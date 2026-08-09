# 07. Resolved Ambiguities and Claim Boundaries

この文書は、Design Baselineのセルフレビューで誤実装リスクが高い境界を明文化する。新機能を追加する文書ではなく、既存仕様の優先解釈を固定する。

## 1. Tsunami replay must not create unsupported survival claims

### CLAR-TSU-001

`illustrative` な津波Replayだけを根拠として、プレイヤーに津波由来の `fatal_equivalent`、負傷、または「間に合った/間に合わなかった」という定量的な生存判定を与えてはならない。

### CLAR-TSU-002

地点別到達時間・時刻別水深・流速等についてRights-approvedかつ意味的に適切な時系列データ、または検証済み `app_physics` が存在しない場合、時間依存の津波安全判定は `undetermined` を許容しなければならない。

### CLAR-TSU-003

MVPに「津波Replayを体験する」が含まれることは、「公式に確認された到達時間を再現する」ことを意味しない。

MVPで保証するのは次の分離である。

```text
Official Hazard Envelope
  → どこが最大クラス想定で浸水対象となり得るか、最大浸水深等

Replay
  → 時間の流れを伴う訓練体験。Evidence Classを明示
```

### CLAR-TSU-004

「あと何分で津波が来るか」を表示できるのは、その時刻の根拠がScenarioのProvenanceから追跡できる場合のみとする。

根拠がない場合は、時間を捏造するのではなく「このデータから地点別到達時刻は判定できない」と扱う。

## 2. Hazard Envelope is not a safe-floor certificate

### CLAR-SAFE-001

Official Hazard Envelopeの外にいることだけを根拠として、無条件に `safe` と判定してはならない。

他の災害、建物被害、火災、道路状況等が存在し得るため、Outcomeは利用可能な全Evidenceを統合する。

### CLAR-SAFE-002

Official Hazard Envelope内にいることだけを根拠として、即 `fatal_equivalent` と判定してはならない。

最大浸水Envelopeは時間依存の個人被災判定器ではない。

## 3. App-derived timing

### CLAR-TIME-001

火災延焼、インフラ停止、NPC避難開始等で `app_derived` / `app_simulated` な時刻を用いる場合、UIとReviewは必要に応じて「アプリ内シミュレーション上の時刻」であることを識別できなければならない。

### CLAR-TIME-002

公的に確認された時刻とアプリ生成時刻を同じ表示スタイルで区別不能にしてはならない。

## 4. Precision shown to the user

### CLAR-PREC-001

内部計算が浮動小数点値を持っていても、元Evidenceが区分値・メッシュ値の場合、UIへ小数点以下の精密値を出す必要はない。

内部表現精度と科学的主張精度を分離する。

## 5. Visual physics and authoritative physics

### CLAR-PHYS-001

Three.js等のlocal rigid-body physicsが偶然生成した接触・破片軌道を、そのまま負傷・道路閉塞等のAuthoritative Eventへ使用してはならない。

評価へ使う物理ComponentはSimulation Coreのauthoritative subsystemとして明示し、determinismとtestを満たす必要がある。

## 6. MVP interpretation

MVP Definition of Doneは「全ての将来災害物理が完成している」ことを意味しない。

特に津波については、現Rights/Data baselineで主張できない到達時間・流速・複数波の精密再現を、見た目を理由にMVP必須へ戻してはならない。

MVPの目的は、**正確性の境界を守った状態で、発災→判断→避難→振り返りの一連の製品体験を成立させること**である。

## 7. Priority

この文書と他文書の解釈が衝突する場合、より保守的に科学的主張・権利利用を制限する解釈を採用し、Design Change Issueで解消する。
