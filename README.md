# disaster_sim

平時に災害を疑似体験し、発災後の避難判断・経路選択・事前防災の効果を学ぶためのWebアプリケーションです。

## Status

- Phase: **Design Baseline**
- Implementation: **Not started**
- Initial target: 徳島市の一部地域
- Initial hazard: 南海トラフ巨大地震 → 津波
- Tracking issue: #1

## Specification

正式仕様は [`docs/spec/README.md`](docs/spec/README.md) を起点に参照してください。

仕様上の最上位原則は次の通りです。

1. データ正確性を見た目より優先する。
2. 公的データ、導出値、アプリ内確率シミュレーション、演出を混同しない。
3. Productionに必要な権利が1項目でも不明なデータは使用しない。
4. 問い合わせ・個別許諾を前提にしない。
5. 本アプリは平時の防災訓練用であり、実災害時の避難ナビゲーションではない。

## Repository policy

Design Baselineの変更はIssueで目的・影響・検証方法を明示し、レビュー可能な差分として行います。科学的主張範囲、Rights Policy、MVP Definition of Doneを実装都合だけで暗黙変更してはいけません。
