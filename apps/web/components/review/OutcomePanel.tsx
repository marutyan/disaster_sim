import type { StoredReview } from "../../lib/review-storage";

export function OutcomePanel({ review }: { review: StoredReview }) {
  const distance = Math.round(review.targetDistanceMeters);
  return (
    <div className="outcome-grid">
      <section>
        <span>公式指定</span>
        <strong>判定対象外</strong>
        <p>合成fixtureの避難施設であり、実在施設の公式指定を表していません。</p>
      </section>
      <section>
        <span>Hazard安全性</span>
        <strong>根拠不足</strong>
        <p>時系列津波場を持たないため、このReplayだけでは生存・死亡時刻を判定しません。</p>
      </section>
      <section>
        <span>訓練目標</span>
        <strong>{review.targetReached ? "到達" : `未到達・残り ${distance} m`}</strong>
        <p>合成Scenario内の移動・経路選択に対する結果です。</p>
      </section>
      <section>
        <span>負傷状態</span>
        <strong>{review.injuryState === "none" ? "無傷" : review.injuryState}</strong>
        <p>HP制ではなく離散状態で記録します。</p>
      </section>
    </div>
  );
}
