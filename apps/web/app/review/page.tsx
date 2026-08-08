"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { OutcomePanel } from "../../components/review/OutcomePanel";
import { Timeline } from "../../components/review/Timeline";
import { DEMO_DATA_NOTICE } from "../../lib/demo-scenario";
import { loadStoredReview, type StoredReview } from "../../lib/review-storage";
import { saveStoredSetup } from "../../lib/storage";

export default function ReviewPage() {
  const router = useRouter();
  const [review, setReview] = useState<StoredReview | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setReview(loadStoredReview(window.sessionStorage));
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <main className="review-loading">振り返りを準備しています…</main>;
  }
  if (!review) {
    return (
      <main className="review-empty">
        <h1>振り返る体験がありません</h1>
        <button className="primary-button" type="button" onClick={() => router.push("/setup")}>
          体験条件を設定する
        </button>
      </main>
    );
  }

  function retrySameSeed() {
    saveStoredSetup(window.localStorage, review.setup);
    router.push("/simulate");
  }

  function retryNewSeed() {
    const setup = { ...review.setup, seed: crypto.randomUUID() };
    saveStoredSetup(window.localStorage, setup);
    router.push("/simulate");
  }

  return (
    <main className="review-shell">
      <header className="review-header">
        <div>
          <a className="brand-link" href="/">防災疑似体験</a>
          <span className="training-inline">振り返り</span>
        </div>
        <button className="secondary-button" type="button" onClick={() => router.push("/setup")}>
          条件を変更
        </button>
      </header>

      <section className="review-intro">
        <p className="step-label">STEP 3 / 3</p>
        <h1>判断と結果を分けて振り返る</h1>
        <p>
          「結果的に助かったから正解」とは評価しません。公式情報、アプリの推定、演出を分けて確認します。
        </p>
      </section>

      <OutcomePanel review={review} />

      <section className="review-section">
        <div className="section-heading">
          <h2>時系列</h2>
          <p>authoritative eventと演出イベントを同じタイムライン上で区別します。</p>
        </div>
        <Timeline events={review.events} />
      </section>

      <section className="review-section review-details">
        <div className="section-heading">
          <h2>この体験の条件</h2>
        </div>
        <dl>
          <div><dt>Seed</dt><dd>{review.seed}</dd></div>
          <div><dt>人物</dt><dd>{review.setup.person}</dd></div>
          <div><dt>時間帯</dt><dd>{review.setup.timeOfDay}</dd></div>
          <div><dt>経路ログ</dt><dd>{review.route.length} points</dd></div>
          <div><dt>終了時刻</dt><dd>{Math.round(review.elapsedSimulationMs / 1000)} 秒</dd></div>
        </dl>
        <p className="data-notice">{DEMO_DATA_NOTICE}</p>
      </section>

      <section className="review-actions">
        <div>
          <h2>条件を変えて比較する</h2>
          <p>同じseedなら主要な確率イベントを再現し、判断の差を比較できます。</p>
        </div>
        <div className="inline-actions">
          <button className="primary-button" type="button" onClick={retrySameSeed}>
            同じseedで再挑戦
          </button>
          <button className="secondary-button" type="button" onClick={retryNewSeed}>
            別seedで再挑戦
          </button>
        </div>
      </section>
    </main>
  );
}
