import { describe, expect, it } from "vitest";

import {
  baseWalkingSpeedMetersPerSecond,
  moveToward,
  normalizedDirection,
} from "../lib/movement";

describe("player movement", () => {
  it("uses stable walking-speed calibration independent of keyboard repeat rate", () => {
    expect(baseWalkingSpeedMetersPerSecond("adult", "day")).toBeCloseTo(0.76);
    expect(baseWalkingSpeedMetersPerSecond("older_adult", "day")).toBeCloseTo(0.53);
    expect(baseWalkingSpeedMetersPerSecond("wheelchair", "night")).toBeCloseTo(
      0.53 * 0.8,
    );
  });

  it("normalizes diagonal keyboard movement", () => {
    const direction = normalizedDirection({ up: true, down: false, left: false, right: true });

    expect(Math.hypot(direction.east, direction.north)).toBeCloseTo(1);
    expect(direction.east).toBeGreaterThan(0);
    expect(direction.north).toBeGreaterThan(0);
  });

  it("moves toward a map destination without overshooting", () => {
    expect(
      moveToward(
        { east: 0, north: 0 },
        { east: 3, north: 4 },
        2,
      ),
    ).toEqual({ east: 1.2, north: 1.6, reached: false });
    expect(
      moveToward(
        { east: 0, north: 0 },
        { east: 3, north: 4 },
        5,
      ),
    ).toEqual({ east: 3, north: 4, reached: true });
  });
});
