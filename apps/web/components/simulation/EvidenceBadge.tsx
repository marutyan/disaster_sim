import type { EvidenceClass } from "@disaster-sim/domain";

const labels: Record<EvidenceClass, string> = {
  official_published: "公表値",
  official_derived: "公表情報から導出",
  app_derived: "アプリ導出",
  app_simulated: "確率シミュレーション",
  illustrative: "演出",
};

export function EvidenceBadge({ evidenceClass }: { evidenceClass: EvidenceClass }) {
  return (
    <span className={`evidence-badge evidence-${evidenceClass}`}>
      {labels[evidenceClass]}
    </span>
  );
}
