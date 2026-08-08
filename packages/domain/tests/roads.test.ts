import { describe, expect, it } from "vitest";

import { blockRoad, createOpenRoad, degradeRoad } from "../src/roads";

describe("road traversal state", () => {
  it("separates open, degraded and blocked traversal states", () => {
    const open = createOpenRoad("edge-1", "prov-road");
    const degraded = degradeRoad(open, "debris", 2.5, "prov-debris");
    const blocked = blockRoad(degraded, "building_collapse", "prov-collapse");

    expect(open).toMatchObject({ state: "open", traversalCostMultiplier: 1 });
    expect(degraded).toMatchObject({
      state: "degraded",
      traversalCostMultiplier: 2.5,
      blockedReasons: ["debris"],
    });
    expect(blocked).toMatchObject({
      state: "blocked",
      traversalCostMultiplier: null,
      blockedReasons: ["debris", "building_collapse"],
    });
    expect(blocked.provenanceIds).toEqual([
      "prov-road",
      "prov-debris",
      "prov-collapse",
    ]);
  });
});
