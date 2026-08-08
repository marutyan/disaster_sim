export type EvidenceClass =
  | "official_published"
  | "official_derived"
  | "app_derived"
  | "app_simulated"
  | "illustrative";

export type ReplayType =
  | "official_timeseries"
  | "app_physics"
  | "app_derived"
  | "illustrative";

export type SpatialRepresentation =
  | "raster"
  | "vector"
  | "mesh"
  | "building"
  | "road_edge"
  | "point";

export type TemporalRepresentation = "static" | "time_series" | "event_series";

export interface TimeRange {
  start: number;
  end: number;
}

export interface ScenarioManifest {
  scenarioId: string;
  scenarioVersion: string;
  title: string;
  regionId: string;
  hazardTypes: string[];
  datasetVersions: Record<string, string>;
  artifactVersion: string;
  defaultSeed: string;
  supportedTimeRangeMs: TimeRange;
}

export interface Field {
  fieldId: string;
  quantity: string;
  unit: string;
  spatialRepresentation: SpatialRepresentation;
  temporalRepresentation: TemporalRepresentation;
  resolutionMeters?: number;
  crs: string;
  artifactUri?: string;
  provenanceId: string;
}

export interface ReplayEvent {
  eventId: string;
  timeMs: number;
  kind: string;
  evidenceClass: EvidenceClass;
  provenanceId: string;
}

export interface ScenarioReplay {
  replayType: ReplayType;
  fields: Field[];
  events: ReplayEvent[];
}

export interface ProvenanceRecord {
  provenanceId: string;
  evidenceClass: EvidenceClass;
  sourceDatasetIds: string[];
  description: string;
}

export interface Scenario {
  manifest: ScenarioManifest;
  hazardEnvelopes: Field[];
  replay: ScenarioReplay;
  provenance: ProvenanceRecord[];
}

const evidenceClasses = new Set<EvidenceClass>([
  "official_published",
  "official_derived",
  "app_derived",
  "app_simulated",
  "illustrative",
]);

const replayTypes = new Set<ReplayType>([
  "official_timeseries",
  "app_physics",
  "app_derived",
  "illustrative",
]);

const spatialRepresentations = new Set<SpatialRepresentation>([
  "raster",
  "vector",
  "mesh",
  "building",
  "road_edge",
  "point",
]);

const temporalRepresentations = new Set<TemporalRepresentation>([
  "static",
  "time_series",
  "event_series",
]);

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function stringValue(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string`);
  }
  return value;
}

function numberValue(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
  return value;
}

function arrayValue(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`);
  }
  return value;
}

function stringArray(value: unknown, label: string): string[] {
  return arrayValue(value, label).map((item, index) =>
    stringValue(item, `${label}[${index}]`),
  );
}

function enumValue<T extends string>(
  value: unknown,
  allowed: ReadonlySet<T>,
  message: string,
): T {
  if (typeof value !== "string" || !allowed.has(value as T)) {
    throw new Error(message);
  }
  return value as T;
}

function parseField(value: unknown, label: string): Field {
  const raw = record(value, label);
  const result: Field = {
    fieldId: stringValue(raw.fieldId, `${label}.fieldId`),
    quantity: stringValue(raw.quantity, `${label}.quantity`),
    unit: stringValue(raw.unit, `${label}.unit`),
    spatialRepresentation: enumValue(
      raw.spatialRepresentation,
      spatialRepresentations,
      "invalid spatial representation",
    ),
    temporalRepresentation: enumValue(
      raw.temporalRepresentation,
      temporalRepresentations,
      "invalid temporal representation",
    ),
    crs: stringValue(raw.crs, `${label}.crs`),
    provenanceId: stringValue(raw.provenanceId, `${label}.provenanceId`),
  };

  if (raw.resolutionMeters !== undefined) {
    result.resolutionMeters = numberValue(
      raw.resolutionMeters,
      `${label}.resolutionMeters`,
    );
  }
  if (raw.artifactUri !== undefined) {
    result.artifactUri = stringValue(raw.artifactUri, `${label}.artifactUri`);
  }
  return result;
}

function parseManifest(value: unknown): ScenarioManifest {
  const raw = record(value, "manifest");
  const datasetVersionsRaw = record(
    raw.datasetVersions,
    "manifest.datasetVersions",
  );
  const datasetVersions = Object.fromEntries(
    Object.entries(datasetVersionsRaw).map(([key, item]) => [
      key,
      stringValue(item, `manifest.datasetVersions.${key}`),
    ]),
  );
  const timeRange = record(
    raw.supportedTimeRangeMs,
    "manifest.supportedTimeRangeMs",
  );

  return {
    scenarioId: stringValue(raw.scenarioId, "manifest.scenarioId"),
    scenarioVersion: stringValue(
      raw.scenarioVersion,
      "manifest.scenarioVersion",
    ),
    title: stringValue(raw.title, "manifest.title"),
    regionId: stringValue(raw.regionId, "manifest.regionId"),
    hazardTypes: stringArray(raw.hazardTypes, "manifest.hazardTypes"),
    datasetVersions,
    artifactVersion: stringValue(
      raw.artifactVersion,
      "manifest.artifactVersion",
    ),
    defaultSeed: stringValue(raw.defaultSeed, "manifest.defaultSeed"),
    supportedTimeRangeMs: {
      start: numberValue(
        timeRange.start,
        "manifest.supportedTimeRangeMs.start",
      ),
      end: numberValue(timeRange.end, "manifest.supportedTimeRangeMs.end"),
    },
  };
}

function parseReplay(value: unknown): ScenarioReplay {
  const raw = record(value, "replay");
  return {
    replayType: enumValue(raw.replayType, replayTypes, "invalid replay type"),
    fields: arrayValue(raw.fields, "replay.fields").map((field, index) =>
      parseField(field, `replay.fields[${index}]`),
    ),
    events: arrayValue(raw.events, "replay.events").map((event, index) => {
      const item = record(event, `replay.events[${index}]`);
      return {
        eventId: stringValue(item.eventId, `replay.events[${index}].eventId`),
        timeMs: numberValue(item.timeMs, `replay.events[${index}].timeMs`),
        kind: stringValue(item.kind, `replay.events[${index}].kind`),
        evidenceClass: enumValue(
          item.evidenceClass,
          evidenceClasses,
          "invalid evidence class",
        ),
        provenanceId: stringValue(
          item.provenanceId,
          `replay.events[${index}].provenanceId`,
        ),
      };
    }),
  };
}

function parseProvenance(value: unknown): ProvenanceRecord[] {
  return arrayValue(value, "provenance").map((entry, index) => {
    const raw = record(entry, `provenance[${index}]`);
    return {
      provenanceId: stringValue(
        raw.provenanceId,
        `provenance[${index}].provenanceId`,
      ),
      evidenceClass: enumValue(
        raw.evidenceClass,
        evidenceClasses,
        "invalid evidence class",
      ),
      sourceDatasetIds: stringArray(
        raw.sourceDatasetIds,
        `provenance[${index}].sourceDatasetIds`,
      ),
      description: stringValue(
        raw.description,
        `provenance[${index}].description`,
      ),
    };
  });
}

export function parseScenario(value: unknown): Scenario {
  const raw = record(value, "scenario");
  const hazardEnvelopes = arrayValue(
    raw.hazardEnvelopes,
    "hazardEnvelopes",
  ).map((field, index) => parseField(field, `hazardEnvelopes[${index}]`));

  if (
    hazardEnvelopes.some((field) => field.temporalRepresentation !== "static")
  ) {
    throw new Error("hazard envelopes must use static temporal representation");
  }

  return {
    manifest: parseManifest(raw.manifest),
    hazardEnvelopes,
    replay: parseReplay(raw.replay),
    provenance: parseProvenance(raw.provenance),
  };
}
