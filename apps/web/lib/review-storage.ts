import type { SimulationEvent } from "@disaster-sim/domain";

import type { StoredSetup } from "./storage";

export const REVIEW_STORAGE_KEY = "disaster-sim:review:v1";

export interface StoredReview {
  version: 1;
  setup: StoredSetup;
  seed: string;
  elapsedSimulationMs: number;
  targetReached: boolean;
  targetDistanceMeters: number;
  events: SimulationEvent[];
  route: { east: number; north: number }[];
  injuryState: "none" | "minor" | "severe" | "fatal_equivalent";
}

export function saveStoredReview(
  storage: Pick<Storage, "setItem">,
  review: StoredReview,
): void {
  storage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(review));
}

export function loadStoredReview(
  storage: Pick<Storage, "getItem">,
): StoredReview | null {
  const raw = storage.getItem(REVIEW_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as StoredReview;
    return parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}
