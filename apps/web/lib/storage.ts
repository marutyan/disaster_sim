export type PersonPreset = "adult" | "child" | "older_adult" | "wheelchair";
export type TimeOfDay = "day" | "night";

export interface StoredLocation {
  label: string;
  latitude: number;
  longitude: number;
}

export interface PreparednessProfile {
  furnitureAnchored: boolean;
  flashlight: boolean;
  mobileBattery: boolean;
  offlineMap: boolean;
}

export interface StoredSetup {
  version: 1;
  scenarioId: string;
  seed: string;
  location: StoredLocation;
  person: PersonPreset;
  timeOfDay: TimeOfDay;
  preparedness: PreparednessProfile;
}

export const SETUP_STORAGE_KEY = "disaster-sim:setup:v1";

const PERSON_PRESETS = new Set<PersonPreset>([
  "adult",
  "child",
  "older_adult",
  "wheelchair",
]);
const TIMES_OF_DAY = new Set<TimeOfDay>(["day", "night"]);

function isBooleanRecord(value: unknown): value is PreparednessProfile {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return [
    record.furnitureAnchored,
    record.flashlight,
    record.mobileBattery,
    record.offlineMap,
  ].every((item) => typeof item === "boolean");
}

export function encodeStoredSetup(setup: StoredSetup): string {
  return JSON.stringify(setup);
}

export function decodeStoredSetup(value: string): StoredSetup | null {
  try {
    const raw = JSON.parse(value) as Record<string, unknown>;
    if (raw.version !== 1) {
      return null;
    }
    if (
      typeof raw.scenarioId !== "string" ||
      typeof raw.seed !== "string" ||
      !PERSON_PRESETS.has(raw.person as PersonPreset) ||
      !TIMES_OF_DAY.has(raw.timeOfDay as TimeOfDay) ||
      !isBooleanRecord(raw.preparedness)
    ) {
      return null;
    }
    if (
      typeof raw.location !== "object" ||
      raw.location === null ||
      Array.isArray(raw.location)
    ) {
      return null;
    }
    const location = raw.location as Record<string, unknown>;
    if (
      typeof location.label !== "string" ||
      typeof location.latitude !== "number" ||
      !Number.isFinite(location.latitude) ||
      location.latitude < -90 ||
      location.latitude > 90 ||
      typeof location.longitude !== "number" ||
      !Number.isFinite(location.longitude) ||
      location.longitude < -180 ||
      location.longitude > 180
    ) {
      return null;
    }

    return {
      version: 1,
      scenarioId: raw.scenarioId,
      seed: raw.seed,
      location: {
        label: location.label,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      person: raw.person as PersonPreset,
      timeOfDay: raw.timeOfDay as TimeOfDay,
      preparedness: raw.preparedness,
    };
  } catch {
    return null;
  }
}

export function loadStoredSetup(storage: Pick<Storage, "getItem">): StoredSetup | null {
  const value = storage.getItem(SETUP_STORAGE_KEY);
  return value ? decodeStoredSetup(value) : null;
}

export function saveStoredSetup(
  storage: Pick<Storage, "setItem">,
  setup: StoredSetup,
): void {
  storage.setItem(SETUP_STORAGE_KEY, encodeStoredSetup(setup));
}
