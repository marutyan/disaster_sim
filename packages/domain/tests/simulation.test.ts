import { describe, expect, it } from "vitest";

import {
  advanceSimulation,
  createSimulationRun,
  type SimulationConfig,
  setTimeScale,
} from "../src/simulation";

const config: SimulationConfig = {
  identity: {
    scenarioId: "tokushima-contract-demo",
    scenarioVersion: "1.0.0",
    datasetVersions: { demo: "1.0.0" },
    artifactVersions: { scenario: "1.0.0" },
    engineVersion: "0.1.0",
    seed: "repeatable-seed",
    initialConditionsHash: "initial-v1",
    playerProfileHash: "player-v1",
    preparednessProfileHash: "prepared-v1",
  },
  schedule: {
    startMs: -60_000,
    shakingStartMs: 0,
    shakingEndMs: 60_000,
    hazardReplayStartMs: 300_000,
    resolveAtMs: 900_000,
  },
};

describe("simulation engine", () => {
  it("starts one minute before the event and advances only by fixed 50 ms ticks", () => {
    const run = createSimulationRun(config);

    expect(run.simulationTimeMs).toBe(-60_000);
    expect(run.phase).toBe("pre_event");

    const after49Ms = advanceSimulation(run, 49);
    expect(after49Ms.simulationTimeMs).toBe(-60_000);

    const afterOneMoreMs = advanceSimulation(after49Ms, 1);
    expect(afterOneMoreMs.simulationTimeMs).toBe(-59_950);
  });

  it("supports only the approved time scales and pause freezes simulation time", () => {
    const run = createSimulationRun(config);
    const paused = setTimeScale(run, 0);

    expect(advanceSimulation(paused, 5_000).simulationTimeMs).toBe(-60_000);
    expect(() => setTimeScale(run, 3)).toThrowError("unsupported time scale");

    const accelerated = setTimeScale(run, 10);
    expect(advanceSimulation(accelerated, 100).simulationTimeMs).toBe(-59_000);
  });

  it("emits deterministic authoritative events for the same run identity", () => {
    const first = advanceSimulation(createSimulationRun(config), 960_000);
    const second = advanceSimulation(createSimulationRun(config), 960_000);

    const authoritative = (run: typeof first) =>
      run.events.filter((event) => event.authoritative);

    expect(JSON.stringify(authoritative(first))).toBe(
      JSON.stringify(authoritative(second)),
    );
    expect(authoritative(first).map((event) => event.kind)).toEqual([
      "earthquake_started",
      "evacuation_started",
      "scenario_resolved",
    ]);
  });

  it("moves through pre-event, shaking, evacuation, replay and resolved phases", () => {
    let run = createSimulationRun(config);

    run = advanceSimulation(run, 60_000);
    expect(run.phase).toBe("shaking");

    run = advanceSimulation(run, 60_000);
    expect(run.phase).toBe("evacuation");

    run = advanceSimulation(run, 240_000);
    expect(run.phase).toBe("hazard_replay");

    run = advanceSimulation(run, 600_000);
    expect(run.phase).toBe("resolved");
  });

  it("never changes injury state solely because illustrative tsunami replay starts", () => {
    const run = advanceSimulation(createSimulationRun(config), 360_000);
    const replayEvent = run.events.find(
      (event) => event.kind === "tsunami_visualization_started",
    );

    expect(replayEvent).toMatchObject({
      authoritative: false,
      evidenceClass: "illustrative",
    });
    expect(run.injuryState).toBe("none");
  });
});
