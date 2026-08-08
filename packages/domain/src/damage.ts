import { nextRandom, type SeededRngState } from "./rng";

export type BuildingDamageState =
  | "none"
  | "minor"
  | "moderate"
  | "major"
  | "collapse";

export type BuildingAttributeEvidence =
  | "observed"
  | "source_derived"
  | "sampled_latent"
  | "unknown";

export interface DamageDistribution {
  none: number;
  minor: number;
  moderate: number;
  major: number;
  collapse: number;
}

export interface DamageSample {
  state: BuildingDamageState;
  rngState: SeededRngState;
  draw: number;
}

const DAMAGE_STATES: BuildingDamageState[] = [
  "none",
  "minor",
  "moderate",
  "major",
  "collapse",
];

function validateDistribution(distribution: DamageDistribution): void {
  const probabilities = DAMAGE_STATES.map((state) => distribution[state]);
  if (
    probabilities.some(
      (probability) =>
        !Number.isFinite(probability) || probability < 0 || probability > 1,
    )
  ) {
    throw new Error("damage probabilities must be finite values in [0, 1]");
  }

  const sum = probabilities.reduce(
    (total, probability) => total + probability,
    0,
  );
  if (Math.abs(sum - 1) > 1e-9) {
    throw new Error("damage probabilities must sum to 1");
  }
}

export function sampleBuildingDamage(
  distribution: DamageDistribution,
  rng: SeededRngState,
): DamageSample {
  validateDistribution(distribution);
  const random = nextRandom(rng);
  let cumulative = 0;

  for (const state of DAMAGE_STATES) {
    cumulative += distribution[state];
    if (random.value < cumulative) {
      return { state, rngState: random.state, draw: random.value };
    }
  }

  return {
    state: "collapse",
    rngState: random.state,
    draw: random.value,
  };
}
