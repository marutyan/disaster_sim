# Direct Runtime Dependency License Registry

この文書は、fixture MVPで直接利用する主要runtime依存のライセンスをレビュー可能にするためのレジストリである。

> This is not a complete transitive dependency SBOM. 外部向けの正式なバイナリ/コンテナ配布を行う前に、lockfileを固定し、transitive dependencyを含むSBOM/NOTICE生成を別途実施する。

| Component | Role | Declared license | Upstream |
|---|---|---|---|
| Next.js | Web framework | MIT | `vercel/next.js` |
| React / React DOM | UI runtime | MIT | `facebook/react` |
| MapLibre GL JS | 2D map renderer | BSD-3-Clause | `maplibre/maplibre-gl-js` |
| CesiumJS | Geodetic / 3D geospatial utilities | Apache-2.0 | `CesiumGS/cesium` |
| Three.js | Local 3D renderer | MIT | `mrdoob/three.js` |
| FastAPI | HTTP API framework | MIT | `fastapi/fastapi` |
| Pydantic | API contracts / validation | MIT | `pydantic/pydantic` |
| Uvicorn | ASGI server | BSD-3-Clause | `encode/uvicorn` |

## Policy

1. Dependency名だけでライセンスを推測しない。実際に固定するversionのpackage metadata / upstream LICENSEをrelease前に再確認する。
2. Apache-2.0/BSD/MIT等の通知・ライセンス文を削除しない。
3. JavaScript/Pythonのtransitive dependencyを含む配布物については、lockfile/SBOMからthird-party noticeを生成可能にする。
4. ライセンス条件が `UNKNOWN` になった依存は、データRights Gateと同様に配布releaseのblocking issueとして扱う。
5. このMVPで外部地図tile/geocoder serviceは直接利用しないため、サービス固有の利用規約を暗黙に受け入れる設計にはしていない。

## Verification references

各ライセンスは2026-08-09時点で各upstream repositoryのLICENSE/package metadataを確認した上で記録する。version更新時は本表も再レビューする。
