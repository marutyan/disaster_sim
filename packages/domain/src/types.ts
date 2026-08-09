export const EVIDENCE_CLASSES = [
  'official_published',
  'official_derived',
  'app_derived',
  'app_simulated',
  'illustrative',
] as const;

export type EvidenceClass = (typeof EVIDENCE_CLASSES)[number];

export const RIGHTS_DECISIONS = ['ALLOW', 'DENY', 'UNKNOWN', 'NOT_APPLICABLE'] as const;

export type RightsDecision = (typeof RIGHTS_DECISIONS)[number];

export interface ScenarioRunIdentity {
  scenarioId: string;
  scenarioVersion: string;
  datasetVersions: Readonly<Record<string, string>>;
  artifactVersions: Readonly<Record<string, string>>;
  engineVersion: string;
  seed: string;
  initialConditionsHash: string;
  playerProfileHash: string;
  preparednessProfileHash: string;
}

function sortRecord(record: Readonly<Record<string, string>>): Record<string, string> {
  return Object.fromEntries(Object.entries(record).sort(([left], [right]) => left.localeCompare(right)));
}

export function createRunIdentityKey(identity: ScenarioRunIdentity): string {
  return JSON.stringify({
    scenarioId: identity.scenarioId,
    scenarioVersion: identity.scenarioVersion,
    datasetVersions: sortRecord(identity.datasetVersions),
    artifactVersions: sortRecord(identity.artifactVersions),
    engineVersion: identity.engineVersion,
    seed: identity.seed,
    initialConditionsHash: identity.initialConditionsHash,
    playerProfileHash: identity.playerProfileHash,
    preparednessProfileHash: identity.preparednessProfileHash,
  });
}
