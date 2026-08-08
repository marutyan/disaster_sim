import { describe, expect, it } from "vitest";

import {
  decodeStoredSetup,
  encodeStoredSetup,
  type StoredSetup,
} from "../lib/storage";

const setup: StoredSetup = {
  version: 1,
  scenarioId: "tokushima-demo",
  seed: "demo-seed",
  location: { label: "デモ開始地点", latitude: 34.07, longitude: 134.568 },
  person: "adult",
  timeOfDay: "day",
  preparedness: {
    furnitureAnchored: true,
    flashlight: true,
    mobileBattery: false,
    offlineMap: true,
  },
};

describe("stored setup", () => {
  it("round-trips a versioned setup", () => {
    expect(decodeStoredSetup(encodeStoredSetup(setup))).toEqual(setup);
  });

  it("rejects an unknown storage version", () => {
    expect(
      decodeStoredSetup(JSON.stringify({ ...setup, version: 999 })),
    ).toBeNull();
  });

  it("rejects malformed coordinates", () => {
    expect(
      decodeStoredSetup(
        JSON.stringify({
          ...setup,
          location: { ...setup.location, latitude: "not-a-number" },
        }),
      ),
    ).toBeNull();
  });
});
