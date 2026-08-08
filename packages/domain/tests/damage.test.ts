import { describe, expect, it } from "vitest";

import { sampleBuildingDamage } from "../src/damage";
import { createSeededRng } from "../src/rng";

describe("building damage sampling", () => {
  it("is deterministic for the same explicit rng state", () => {
    const distribution = {
      none: 0.2,
      minor: 0.2,
      moderate: 0.2,
      major: 0.2,
      collapse: 0.2,
    } as const;
    const rng = createSeededRng("building-123");

    expect(sampleBuildingDamage(distribution, rng)).toEqual(
      sampleBuildingDamage(distribution, rng),
    );
  });

  it("rejects invalid probability distributions", () => {
    expect(() =>
      sampleBuildingDamage(
        { none: 0.9, minor: 0.9, moderate: 0, major: 0, collapse: 0 },
        createSeededRng("invalid"),
      ),
    ).toThrowError("damage probabilities must sum to 1");
  });
});
