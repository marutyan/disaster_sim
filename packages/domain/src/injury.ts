import type { EvidenceClass } from "./contracts";
import type { InjuryState } from "./simulation";

const INJURY_RANK: Record<InjuryState, number> = {
  none: 0,
  minor: 1,
  severe: 2,
  fatal_equivalent: 3,
};

export function applyInjury(
  current: InjuryState,
  proposed: InjuryState,
  evidenceClass: EvidenceClass,
): InjuryState {
  if (evidenceClass === "illustrative") {
    return current;
  }
  return INJURY_RANK[proposed] > INJURY_RANK[current] ? proposed : current;
}
