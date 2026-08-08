export const DEMO_SCENARIO = {
  scenarioId: "tokushima-demo",
  title: "徳島市デモ領域：南海トラフ地震・津波",
  subtitle: "アプリ所有の合成地理データによるMVP体験",
  center: { latitude: 34.0704, longitude: 134.5688 },
  bounds: {
    west: 134.562,
    south: 34.064,
    east: 134.576,
    north: 34.077,
  },
  evacuationTarget: {
    id: "demo-evacuation-building",
    label: "デモ津波避難施設",
    latitude: 34.0741,
    longitude: 134.5732,
  },
  hazardPolygon: [
    [134.5625, 34.0645],
    [134.5756, 34.0645],
    [134.5756, 34.0719],
    [134.5698, 34.0732],
    [134.565, 34.0714],
    [134.5625, 34.069],
    [134.5625, 34.0645],
  ] as [number, number][],
  roads: [
    [
      [134.563, 34.067],
      [134.575, 34.067],
    ],
    [
      [134.563, 34.07],
      [134.575, 34.07],
    ],
    [
      [134.563, 34.073],
      [134.575, 34.073],
    ],
    [
      [134.566, 34.065],
      [134.566, 34.076],
    ],
    [
      [134.57, 34.065],
      [134.57, 34.076],
    ],
    [
      [134.573, 34.065],
      [134.573, 34.076],
    ],
  ] as [number, number][][],
} as const;

export const DEMO_DATA_NOTICE =
  "このMVPの道路・浸水形状・避難施設位置はアプリ検証用の合成fixtureです。徳島県・徳島市の個別地点に対する公式予測ではありません。";
