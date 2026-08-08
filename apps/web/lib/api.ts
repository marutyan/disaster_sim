import type { StoredReview } from "./review-storage";
import type { StoredSetup } from "./storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

export interface RemoteRunRegistration {
  runId: string;
  identity: {
    scenarioId: string;
    scenarioVersion: string;
    seed: string;
  };
  schedule: {
    startMs: number;
    shakingStartMs: number;
    shakingEndMs: number;
    hazardReplayStartMs: number;
    resolveAtMs: number;
  };
}

export interface RemoteReviewResult {
  officialStatus: "designated" | "non_designated" | "unknown";
  hazardStatus:
    | "outside_official_envelope"
    | "inside_official_envelope"
    | "insufficient_evidence";
  simulatedOutcome:
    | "safe"
    | "minor_injury"
    | "severe_injury"
    | "fatal_equivalent"
    | "undetermined";
  trainingGoalReached: boolean;
  notes: string[];
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export function registerRemoteRun(
  setup: StoredSetup,
): Promise<RemoteRunRegistration> {
  return postJson<RemoteRunRegistration>("/api/runs", {
    scenarioId: setup.scenarioId,
    seed: setup.seed,
    person: setup.person,
    timeOfDay: setup.timeOfDay,
    preparedness: setup.preparedness,
  });
}

export function submitRemoteReview(
  review: StoredReview,
): Promise<RemoteReviewResult> {
  return postJson<RemoteReviewResult>("/api/reviews", {
    scenarioId: review.setup.scenarioId,
    targetReached: review.targetReached,
    targetDistanceMeters: review.targetDistanceMeters,
    injuryState: review.injuryState,
    replayEvidenceClass: "illustrative",
  });
}
