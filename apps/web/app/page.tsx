import Link from "next/link";

const principles = [
  "公的データとアプリの演出を分けて表示",
  "避難開始・経路・避難先を自分で判断",
  "体験後に判断と結果を時系列で振り返る",
] as const;

export default function HomePage() {
  return (
    <main className="landing-shell">
      <header className="product-header landing-header">
        <span className="brand-link">防災疑似体験</span>
        <span className="training-inline">平時の訓練用</span>
      </header>
      <section className="landing-content" aria-labelledby="page-title">
        <div className="landing-copy">
          <h1 id="page-title">災害が迫る時間を、自分の判断で追体験する。</h1>
          <p className="lead">
            自宅・学校・職場など、普段いる場所を起点に、発災から避難までを3Dと地図で体験します。
          </p>
          <div className="training-notice" role="note">
            <strong>これは平時の訓練用です。</strong>
            <span>
              実際の災害時は自治体・気象庁など公的機関の情報を優先してください。
            </span>
          </div>
          <Link className="primary-action" href="/setup">
            体験を始める
          </Link>
        </div>
        <section className="landing-principles" aria-label="このアプリの方針">
          {principles.map((principle, index) => (
            <div key={principle}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{principle}</p>
            </div>
          ))}
        </section>
      </section>
      <footer className="landing-footer">
        <span>初期MVP: 徳島市デモ領域 / 地震 → 津波避難</span>
        <span>公的値・アプリ推定・演出を明示的に分離</span>
      </footer>
    </main>
  );
}
