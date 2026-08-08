import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { parseScenario } from "../src/contracts";

const fixturePath = fileURLToPath(
  new URL("../../../data/fixtures/contract-scenario.json", import.meta.url),
);

describe("scenario contract", () => {
  it("parses the shared golden scenario fixture", () => {
    const scenario = parseScenario(
      JSON.parse(readFileSync(fixturePath, "utf8")),
    );

    expect(scenario.manifest.scenarioId).toBe("tokushima-contract-demo");
    expect(scenario.hazardEnvelopes[0]?.temporalRepresentation).toBe("static");
    expect(scenario.replay.replayType).toBe("illustrative");
    expect(scenario.provenance[0]?.evidenceClass).toBe("official_published");
  });

  it("rejects a hazard envelope that pretends to be a time series", () => {
    const raw = JSON.parse(readFileSync(fixturePath, "utf8"));
    raw.hazardEnvelopes[0].temporalRepresentation = "time_series";

    expect(() => parseScenario(raw)).toThrowError(
      "hazard envelopes must use static temporal representation",
    );
  });

  it("rejects unknown evidence classes", () => {
    const raw = JSON.parse(readFileSync(fixturePath, "utf8"));
    raw.provenance[0].evidenceClass = "official-ish";

    expect(() => parseScenario(raw)).toThrowError("invalid evidence class");
  });
});
