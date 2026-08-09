"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import {
  DEMO_DATA_NOTICE,
  DEMO_SCENARIO,
  isInsideDemoBounds,
} from "../../lib/demo-scenario";
import { saveStoredSetup, type StoredSetup } from "../../lib/storage";

const defaultSetup: StoredSetup = {
  version: 1,
  scenarioId: DEMO_SCENARIO.scenarioId,
  seed: "tokushima-demo-001",
  location: {
    label: "徳島市デモ開始地点",
    latitude: DEMO_SCENARIO.center.latitude,
    longitude: DEMO_SCENARIO.center.longitude,
  },
  person: "adult",
  timeOfDay: "day",
  preparedness: {
    furnitureAnchored: false,
    flashlight: true,
    mobileBattery: true,
    offlineMap: false,
  },
};

export default function SetupPage() {
  const router = useRouter();
  const [setup, setSetup] = useState<StoredSetup>(defaultSetup);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isInsideDemoBounds(setup.location)) {
      setLocationMessage(
        "このfixture MVPでは徳島市デモ領域内の地点だけを開始地点にできます。デモ地点へ戻すか、表示範囲内の緯度経度を指定してください。",
      );
      return;
    }
    saveStoredSetup(window.localStorage, setup);
    router.push("/simulate");
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("このブラウザでは現在地を取得できません。");
      return;
    }
    setLocationMessage("現在地を取得しています…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          label: "現在地",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        if (!isInsideDemoBounds(location)) {
          setLocationMessage(
            "現在地は合成デモ領域の外です。このMVPでは実地域の災害形状をまだ利用しないため、現在地へ移動せずデモ地点を維持します。",
          );
          return;
        }
        setSetup((current) => ({ ...current, location }));
        setLocationMessage("現在地をブラウザ内の体験条件へ反映しました。");
      },
      () =>
        setLocationMessage(
          "現在地を取得できませんでした。デモ領域内の地点を手動で指定してください。",
        ),
      { enableHighAccuracy: true, timeout: 8_000 },
    );
  }

  function resetDemoLocation() {
    setSetup((current) => ({
      ...current,
      location: { ...defaultSetup.location },
    }));
    setLocationMessage("合成デモ領域の中心地点へ戻しました。");
  }

  return (
    <main className="setup-shell">
      <header className="product-header">
        <a className="brand-link" href="/">
          防災疑似体験
        </a>
        <p>平時の訓練用</p>
      </header>

      <form className="setup-form" onSubmit={submit}>
        <section className="setup-intro">
          <p className="step-label">STEP 1 / 3</p>
          <h1>体験条件を決める</h1>
          <p>
            同じ場所でも、時間帯・身体条件・普段の備えで避難結果は変わります。
          </p>
        </section>

        <section className="form-section" aria-labelledby="scenario-heading">
          <div>
            <h2 id="scenario-heading">シナリオ</h2>
            <p>初期MVPは地震から津波避難までを一続きで体験します。</p>
          </div>
          <div className="scenario-summary">
            <strong>{DEMO_SCENARIO.title}</strong>
            <span>{DEMO_SCENARIO.subtitle}</span>
          </div>
          <p className="data-notice">{DEMO_DATA_NOTICE}</p>
        </section>

        <section className="form-section" aria-labelledby="location-heading">
          <div>
            <h2 id="location-heading">開始地点</h2>
            <p>
              位置情報は既定ではブラウザ内だけに保存します。fixture MVPでは合成デモ領域内だけを選べます。
            </p>
          </div>
          <div className="field-grid three-columns">
            <label>
              地点名
              <input
                value={setup.location.label}
                onChange={(event) =>
                  setSetup((current) => ({
                    ...current,
                    location: { ...current.location, label: event.target.value },
                  }))
                }
              />
            </label>
            <label>
              緯度
              <input
                type="number"
                step="0.000001"
                min={DEMO_SCENARIO.bounds.south}
                max={DEMO_SCENARIO.bounds.north}
                value={setup.location.latitude}
                onChange={(event) =>
                  setSetup((current) => ({
                    ...current,
                    location: {
                      ...current.location,
                      latitude: Number(event.target.value),
                    },
                  }))
                }
              />
            </label>
            <label>
              経度
              <input
                type="number"
                step="0.000001"
                min={DEMO_SCENARIO.bounds.west}
                max={DEMO_SCENARIO.bounds.east}
                value={setup.location.longitude}
                onChange={(event) =>
                  setSetup((current) => ({
                    ...current,
                    location: {
                      ...current.location,
                      longitude: Number(event.target.value),
                    },
                  }))
                }
              />
            </label>
          </div>
          <div className="inline-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={useCurrentLocation}
            >
              現在地を使う
            </button>
            <button
              className="text-button"
              type="button"
              onClick={resetDemoLocation}
            >
              デモ地点に戻す
            </button>
          </div>
          {locationMessage ? (
            <p className="field-message" aria-live="polite">
              {locationMessage}
            </p>
          ) : null}
        </section>

        <section className="form-section" aria-labelledby="person-heading">
          <div>
            <h2 id="person-heading">人物と時間</h2>
            <p>移動能力と夜間条件をシミュレーションへ反映します。</p>
          </div>
          <div className="field-grid">
            <label>
              人物プリセット
              <select
                value={setup.person}
                onChange={(event) =>
                  setSetup((current) => ({
                    ...current,
                    person: event.target.value as StoredSetup["person"],
                  }))
                }
              >
                <option value="adult">成人</option>
                <option value="child">子ども</option>
                <option value="older_adult">高齢者</option>
                <option value="wheelchair">車椅子利用</option>
              </select>
            </label>
            <label>
              時間帯
              <select
                value={setup.timeOfDay}
                onChange={(event) =>
                  setSetup((current) => ({
                    ...current,
                    timeOfDay: event.target.value as StoredSetup["timeOfDay"],
                  }))
                }
              >
                <option value="day">昼間</option>
                <option value="night">夜間</option>
              </select>
            </label>
            <label>
              再現seed
              <input
                value={setup.seed}
                onChange={(event) =>
                  setSetup((current) => ({ ...current, seed: event.target.value }))
                }
              />
            </label>
          </div>
        </section>

        <section className="form-section" aria-labelledby="preparedness-heading">
          <div>
            <h2 id="preparedness-heading">普段の備え</h2>
            <p>再挑戦時に条件を変えて結果を比較できます。</p>
          </div>
          <div className="check-list">
            {(
              [
                ["furnitureAnchored", "家具を固定している"],
                ["flashlight", "懐中電灯を準備している"],
                ["mobileBattery", "モバイルバッテリーを準備している"],
                ["offlineMap", "オフライン地図を準備している"],
              ] as const
            ).map(([key, label]) => (
              <label className="check-row" key={key}>
                <input
                  type="checkbox"
                  checked={setup.preparedness[key]}
                  onChange={(event) =>
                    setSetup((current) => ({
                      ...current,
                      preparedness: {
                        ...current.preparedness,
                        [key]: event.target.checked,
                      },
                    }))
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </section>

        <footer className="setup-footer">
          <p>開始後は発災約1分前から時間が進みます。</p>
          <button className="primary-button" type="submit">
            シミュレーションを開始
          </button>
        </footer>
      </form>
    </main>
  );
}
