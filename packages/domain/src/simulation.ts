import type { EvidenceClass } from "./contracts";

export const SIMULATION_TICK_MS = 50 as const;
export const SUPPORTED_TIME_SCALES = [0, 1, 2, 5, 10] as const;

export type TimeScale = (typeof SUPPORTED_TIME_SCALES)[number];
export type SimulationPhase =
  | "pre_event"
  | "shaking"
  | "evacuation"
  | "hazard_replay"
  | "resolved";
export type InjuryState = "none" | "minor" | "severe" | "fatal_equivalent";

export interface SimulationRunIdentity {
  scenarioId: string;
  scenarioVersion: string;
  datasetVersions: Record<string, string>;
  artifactVersions: Record<string, string>;
  engineVersion: string;
  seed: string;
  initialConditionsHash: string;
  playerProfileHash: string;
  preparednessProfileHash: string;
}

export interface SimulationSchedule {
  startMs: number;
  shakingStartMs: number;
  shakingEndMs: number;
  hazardReplayStartMs: number;
  resolveAtMs: number;
}

export interface SimulationConfig {
  identity: SimulationRunIdentity;
  schedule: SimulationSchedule;
}

export interface SimulationEvent {
  eventId: string;
  timeMs: number;
  kind:
    | "earthquake_started"
    | "evacuation_started"
    | "tsunami_visualization_started"
    | "scenario_resolved";
  evidenceClass: EvidenceClass;
  authoritative: boolean;
}

export interface SimulationRun {
  config: SimulationConfig;
  simulationTimeMs: number;
  phase: SimulationPhase;
  timeScale: TimeScale;
  tickRemainderMs: number;
  injuryState: InjuryState;
  events: SimulationEvent[];
}

function assertSchedule(schedule: SimulationSchedule): void {
  if (
    !(
      schedule.startMs < schedule.shakingStartMs &&
      schedule.shakingStartMs < schedule.shakingEndMs &&
      schedule.shakingEndMs <= schedule.hazardReplayStartMs &&
      schedule.hazardReplayStartMs < schedule.resolveAtMs
    )
  ) {
    throw new Error("invalid simulation schedule");
  }
}

function phaseAt(timeMs: number, schedule: SimulationSchedule): SimulationPhase {
  if (timeMs >= schedule.resolveAtMs) {
    return "resolved";
  }
  if (timeMs >= schedule.hazardReplayStartMs) {
    return "hazard_replay";
  }
  if (timeMs >= schedule.shakingEndMs) {
    return "evacuation";
  }
  if (timeMs >= schedule.shakingStartMs) {
    return "shaking";
  }
  return "pre_event";
}

function crossed(previous: number, next: number, threshold: number): boolean {
  return previous < threshold && next >= threshold;
}

function eventsCrossed(
  previousTimeMs: number,
  nextTimeMs: number,
  schedule: SimulationSchedule,
): SimulationEvent[] {
  const events: SimulationEvent[] = [];

  if (crossed(previousTimeMs, nextTimeMs, schedule.shakingStartMs)) {
    events.push({
      eventId: "earthquake-started",
      timeMs: schedule.shakingStartMs,
      kind: "earthquake_started",
      evidenceClass: "official_derived",
      authoritative: true,
    });
  }

  if (crossed(previousTimeMs, nextTimeMs, schedule.shakingEndMs)) {
    events.push({
      eventId: "evacuation-started",
      timeMs: schedule.shakingEndMs,
      kind: "evacuation_started",
      evidenceClass: "app_derived",
      authoritative: true,
    });
  }

  if (crossed(previousTimeMs, nextTimeMs, schedule.hazardReplayStartMs)) {
    events.push({
      eventId: "tsunami-visualization-started",
      timeMs: schedule.hazardReplayStartMs,
      kind: "tsunami_visualization_started",
      evidenceClass: "illustrative",
      authoritative: false,
    });
  }

  if (crossed(previousTimeMs, nextTimeMs, schedule.resolveAtMs)) {
    events.push({
      eventId: "scenario-resolved",
      timeMs: schedule.resolveAtMs,
      kind: "scenario_resolved",
      evidenceClass: "app_derived",
      authoritative: true,
    });
  }

  return events;
}

export function createSimulationRun(config: SimulationConfig): SimulationRun {
  assertSchedule(config.schedule);
  return {
    config,
    simulationTimeMs: config.schedule.startMs,
    phase: phaseAt(config.schedule.startMs, config.schedule),
    timeScale: 1,
    tickRemainderMs: 0,
    injuryState: "none",
    events: [],
  };
}

export function setTimeScale(run: SimulationRun, scale: number): SimulationRun {
  if (!SUPPORTED_TIME_SCALES.includes(scale as TimeScale)) {
    throw new Error("unsupported time scale");
  }
  return { ...run, timeScale: scale as TimeScale };
}

export function advanceSimulation(
  run: SimulationRun,
  realDeltaMs: number,
): SimulationRun {
  if (!Number.isFinite(realDeltaMs) || realDeltaMs < 0) {
    throw new Error("real delta must be a non-negative finite number");
  }
  if (run.timeScale === 0 || run.phase === "resolved") {
    return { ...run };
  }

  const scaledDeltaMs = realDeltaMs * run.timeScale;
  const accumulatedMs = run.tickRemainderMs + scaledDeltaMs;
  const wholeTicks = Math.floor(accumulatedMs / SIMULATION_TICK_MS);
  const simulationAdvanceMs = wholeTicks * SIMULATION_TICK_MS;
  const tickRemainderMs = accumulatedMs - simulationAdvanceMs;

  if (simulationAdvanceMs === 0) {
    return { ...run, tickRemainderMs };
  }

  const previousTimeMs = run.simulationTimeMs;
  const unclampedTimeMs = previousTimeMs + simulationAdvanceMs;
  const simulationTimeMs = Math.min(unclampedTimeMs, run.config.schedule.resolveAtMs);
  const newEvents = eventsCrossed(
    previousTimeMs,
    simulationTimeMs,
    run.config.schedule,
  );

  return {
    ...run,
    simulationTimeMs,
    phase: phaseAt(simulationTimeMs, run.config.schedule),
    tickRemainderMs: simulationTimeMs >= run.config.schedule.resolveAtMs ? 0 : tickRemainderMs,
    events: [...run.events, ...newEvents],
  };
}
