import { describe, expect, it } from "vitest";

import { applyInjury } from "../src/injury";

describe("injury state", () => {
  it("uses discrete monotonic states instead of hit points", () => {
    expect(applyInjury("none", "minor", "app_simulated")).toBe("minor");
    expect(applyInjury("minor", "severe", "app_simulated")).toBe("severe");
    expect(applyInjury("severe", "minor", "app_simulated")).toBe("severe");
  });

  it("does not allow illustrative effects to authoritatively injure the player", () => {
    expect(applyInjury("none", "fatal_equivalent", "illustrative")).toBe("none");
  });

  it("allows an evidence-backed simulation event to reach fatal equivalent", () => {
    expect(applyInjury("severe", "fatal_equivalent", "app_simulated")).toBe(
      "fatal_equivalent",
    );
  });
});
