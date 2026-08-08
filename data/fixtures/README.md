# Application-owned fixtures

このディレクトリのMVP fixtureは、実装・契約・UIの検証目的で本プロジェクトが作成した合成データです。

## Important boundary

- 実在する徳島県・徳島市の道路形状、建物形状、津波到達時間等を複製したものではありません。
- `tokushima-demo-scenario.json` のHazard Envelopeは `app_derived`、津波Replayは `illustrative` です。
- fixtureの緯度経度は徳島市付近を舞台にUI/座標処理を検証するための基準点であり、その地点の公式被害予測ではありません。
- Productionの実公的データへ差し替える場合は `docs/spec/03-data-rights-and-provenance.md` のRights Gateを通過する必要があります。

権利条件が不明な公的データを、このfixtureへ写経・補間して混入してはいけません。
