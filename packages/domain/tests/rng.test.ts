import { describe, expect, it } from "vitest";

import { createSeededRng, nextRandom } from "../src/rng";

function sequence(seed: string, count: number): number[] {
  let rng = createSeededRng(seed);
  const values: number[] = [];

  for (let index = 0; index < count; index += 1) {
    const next = nextRandom(rng);
    rng = next.state;
    values.push(next.value);
  }
  return values;
}

describe("seeded rng", () => {
  it("replays an identical sequence from the same seed", () => {
    expect(sequence("seed-42", 8)).toEqual(sequence("seed-42", 8));
  });

  it("produces a different sequence for a different seed", () => {
    expect(sequence("seed-a", 5)).not.toEqual(sequence("seed-b", 5));
  });

  it("keeps explicit serializable state and produces values in [0, 1)", () => {
    const initial = createSeededRng("serializable");
    const next = nextRandom(initial);

    expect(Number.isInteger(initial.state)).toBe(true);
    expect(next.value).toBeGreaterThanOrEqual(0);
    expect(next.value).toBeLessThan(1);
    expect(JSON.parse(JSON.stringify(next.state))).toEqual(next.state);
  });
});
