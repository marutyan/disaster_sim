import { describe, expect, it } from "vitest";

import { seismicMobilityConstraint } from "../src/mobility";

describe("seismic mobility constraints", () => {
  it("keeps weak shaking separate from severe mobility constraints", () => {
    expect(seismicMobilityConstraint("5_lower")).toBe("normal");
    expect(seismicMobilityConstraint("5_upper")).toBe("impaired");
    expect(seismicMobilityConstraint("6_lower")).toBe("severely_impaired");
    expect(seismicMobilityConstraint("6_upper")).toBe("crawl_or_support");
    expect(seismicMobilityConstraint("7")).toBe("crawl_or_support");
  });

  it("does not expose an invented fall probability", () => {
    const result = seismicMobilityConstraint("6_lower");

    expect(typeof result).toBe("string");
  });
});
