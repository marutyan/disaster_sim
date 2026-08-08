export type RoadTraversalState = "open" | "degraded" | "blocked";
export type RoadBlockReason =
  | "building_collapse"
  | "debris"
  | "fire"
  | "inundation"
  | "infrastructure_failure"
  | "manual_scenario_event";

export interface RoadEdgeState {
  edgeId: string;
  state: RoadTraversalState;
  traversalCostMultiplier: number | null;
  blockedReasons: RoadBlockReason[];
  provenanceIds: string[];
}

function appendUnique<T>(items: readonly T[], item: T): T[] {
  return items.includes(item) ? [...items] : [...items, item];
}

export function createOpenRoad(
  edgeId: string,
  provenanceId: string,
): RoadEdgeState {
  return {
    edgeId,
    state: "open",
    traversalCostMultiplier: 1,
    blockedReasons: [],
    provenanceIds: [provenanceId],
  };
}

export function degradeRoad(
  road: RoadEdgeState,
  reason: RoadBlockReason,
  traversalCostMultiplier: number,
  provenanceId: string,
): RoadEdgeState {
  if (!Number.isFinite(traversalCostMultiplier) || traversalCostMultiplier < 1) {
    throw new Error("degraded road cost multiplier must be at least 1");
  }
  if (road.state === "blocked") {
    return road;
  }

  return {
    ...road,
    state: "degraded",
    traversalCostMultiplier,
    blockedReasons: appendUnique(road.blockedReasons, reason),
    provenanceIds: appendUnique(road.provenanceIds, provenanceId),
  };
}

export function blockRoad(
  road: RoadEdgeState,
  reason: RoadBlockReason,
  provenanceId: string,
): RoadEdgeState {
  return {
    ...road,
    state: "blocked",
    traversalCostMultiplier: null,
    blockedReasons: appendUnique(road.blockedReasons, reason),
    provenanceIds: appendUnique(road.provenanceIds, provenanceId),
  };
}
