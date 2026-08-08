export type RightsDecision = "ALLOW" | "DENY" | "UNKNOWN" | "NOT_APPLICABLE";

export type RightsAction =
  | "fetch"
  | "localStore"
  | "transform"
  | "createDerivative"
  | "cacheClientSide"
  | "cacheServerSide"
  | "redistributeOriginal"
  | "redistributeDerivative"
  | "publicDisplay"
  | "commercialUse";

export interface RightsPolicy {
  licenseId: string;
  decisions: Record<RightsAction, RightsDecision>;
  attributionRequired: boolean;
  modificationNoticeRequired: boolean;
  statutoryRestrictions: string[];
}

export interface RightsBlocker {
  action: RightsAction;
  decision: Exclude<RightsDecision, "ALLOW">;
}

export interface RightsGateResult {
  allowed: boolean;
  blockers: RightsBlocker[];
}

export function evaluateRights(
  policy: RightsPolicy,
  requiredActions: readonly RightsAction[],
): RightsGateResult {
  const blockers = requiredActions.flatMap<RightsBlocker>((action) => {
    const decision = policy.decisions[action];
    return decision === "ALLOW" ? [] : [{ action, decision }];
  });

  return {
    allowed: blockers.length === 0,
    blockers,
  };
}
