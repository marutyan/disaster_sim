export const SIMULATION_SPEEDS = [1, 2, 5, 10] as const;
export type SimulationSpeed = (typeof SIMULATION_SPEEDS)[number];

export interface SimulationClockOptions {
  tickMs: number;
}

export class SimulationClock {
  readonly tickMs: number;
  tickCount = 0;
  simulationTimeMs = 0;
  accumulatorMs = 0;

  private paused = false;
  private speed: SimulationSpeed = 1;

  constructor({ tickMs }: SimulationClockOptions) {
    if (!Number.isFinite(tickMs) || tickMs <= 0) {
      throw new RangeError('tickMs must be a finite positive number');
    }
    this.tickMs = tickMs;
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
  }

  setSpeed(speed: number): void {
    if (!SIMULATION_SPEEDS.includes(speed as SimulationSpeed)) {
      throw new RangeError(`Unsupported simulation speed: ${speed}`);
    }
    this.speed = speed as SimulationSpeed;
  }

  advance(realDeltaMs: number): number {
    if (!Number.isFinite(realDeltaMs) || realDeltaMs < 0) {
      throw new RangeError('realDeltaMs must be a finite non-negative number');
    }
    if (this.paused || realDeltaMs === 0) {
      return 0;
    }

    this.accumulatorMs += realDeltaMs * this.speed;
    const emittedTicks = Math.floor(this.accumulatorMs / this.tickMs);
    if (emittedTicks === 0) {
      return 0;
    }

    const advancedMs = emittedTicks * this.tickMs;
    this.accumulatorMs -= advancedMs;
    this.tickCount += emittedTicks;
    this.simulationTimeMs += advancedMs;
    return emittedTicks;
  }
}
