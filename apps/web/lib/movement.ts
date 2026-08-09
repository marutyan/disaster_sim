import type { PersonPreset, TimeOfDay } from "./storage";

export interface LocalPosition {
  east: number;
  north: number;
}

export interface DirectionState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export function baseWalkingSpeedMetersPerSecond(
  person: PersonPreset,
  timeOfDay: TimeOfDay,
): number {
  const daytimeSpeed =
    person === "older_adult" || person === "wheelchair" ? 0.53 : 0.76;
  return timeOfDay === "night" ? daytimeSpeed * 0.8 : daytimeSpeed;
}

export function normalizedDirection(keys: DirectionState): LocalPosition {
  const east = Number(keys.right) - Number(keys.left);
  const north = Number(keys.up) - Number(keys.down);
  const magnitude = Math.hypot(east, north);
  if (magnitude === 0) {
    return { east: 0, north: 0 };
  }
  return { east: east / magnitude, north: north / magnitude };
}

export function moveToward(
  current: LocalPosition,
  target: LocalPosition,
  maximumDistanceMeters: number,
): LocalPosition & { reached: boolean } {
  const east = target.east - current.east;
  const north = target.north - current.north;
  const distance = Math.hypot(east, north);

  if (distance === 0 || maximumDistanceMeters >= distance) {
    return { ...target, reached: true };
  }
  if (maximumDistanceMeters <= 0) {
    return { ...current, reached: false };
  }

  const ratio = maximumDistanceMeters / distance;
  return {
    east: current.east + east * ratio,
    north: current.north + north * ratio,
    reached: false,
  };
}
