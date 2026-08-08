import Link from "next/link";

const principles = [
  "公的データとアプリの演出を分けて表示",
  "避難開始・経路・避難先を自分で判断",
  "体験後に判断と結果を時系列で振り返る",
] as const;

export default function HomePage() {
  return (
    <main className="landing-shell">
      <section className="landing-card" aria-labelledby="page-title">
        <p className="eyebrow">DISASTER PREPAREDNESS TRAINING</p>
        <h1 id="page-title">防災疑似体験</h1>
        <p className="lead">
          自宅・学校・職場など、普段いる場所で発災したときの判断を時間軸付きで追体験します。
        </p>
        <div className="training-notice" role="note">
          <strong>これは平時の訓練用です。</strong>
          <span>実際の災害時は自治体・気象庁など公的機関の情報を優先してください。</span>
        </div>
        <ul className="principles">
          {principles.map((principle) => (
            <li key={principle}>{principle}</li>
          ))}
        </ul>
        <Link className="primary-action" href="/setup">
          体験条件を設定する
        </Link>
      </section>
    </main>
  );
}
