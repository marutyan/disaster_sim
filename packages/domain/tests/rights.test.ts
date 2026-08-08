import { describe, expect, it } from "vitest";

import { evaluateRights, type RightsPolicy } from "../src/rights";

const basePolicy: RightsPolicy = {
  licenseId: "TEST-ALLOW",
  decisions: {
    fetch: "ALLOW",
    localStore: "ALLOW",
    transform: "ALLOW",
    createDerivative: "ALLOW",
    cacheClientSide: "ALLOW",
    cacheServerSide: "ALLOW",
    redistributeOriginal: "ALLOW",
    redistributeDerivative: "ALLOW",
    publicDisplay: "ALLOW",
    commercialUse: "ALLOW",
  },
  attributionRequired: true,
  modificationNoticeRequired: false,
  statutoryRestrictions: [],
};

describe("evaluateRights", () => {
  it("allows production use only when every required action is ALLOW", () => {
    const result = evaluateRights(basePolicy, ["transform", "publicDisplay"]);

    expect(result).toEqual({ allowed: true, blockers: [] });
  });

  it("blocks a required UNKNOWN decision", () => {
    const result = evaluateRights(
      {
        ...basePolicy,
        decisions: { ...basePolicy.decisions, createDerivative: "UNKNOWN" },
      },
      ["createDerivative"],
    );

    expect(result).toEqual({
      allowed: false,
      blockers: [{ action: "createDerivative", decision: "UNKNOWN" }],
    });
  });

  it("blocks a required DENY decision", () => {
    const result = evaluateRights(
      {
        ...basePolicy,
        decisions: { ...basePolicy.decisions, publicDisplay: "DENY" },
      },
      ["publicDisplay"],
    );

    expect(result.allowed).toBe(false);
  });

  it("does not care about NOT_APPLICABLE when that action is not required", () => {
    const result = evaluateRights(
      {
        ...basePolicy,
        decisions: { ...basePolicy.decisions, commercialUse: "NOT_APPLICABLE" },
      },
      ["publicDisplay"],
    );

    expect(result.allowed).toBe(true);
  });

  it("blocks NOT_APPLICABLE when the action is actually required", () => {
    const result = evaluateRights(
      {
        ...basePolicy,
        decisions: { ...basePolicy.decisions, commercialUse: "NOT_APPLICABLE" },
      },
      ["commercialUse"],
    );

    expect(result.allowed).toBe(false);
  });
});
