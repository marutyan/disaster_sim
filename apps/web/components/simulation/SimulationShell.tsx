"use client";

import {
  advanceSimulation,
  createSimulationRun,
  type SimulationRun,
  setTimeScale,
  type TimeScale,
} from "@disaster-sim/domain";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { DEMO_DATA_NOTICE, DEMO_SCENARIO } from "../../lib/demo-scenario";
import { geographicToLocalMeters } from "../../lib/geo";
import { saveStoredReview } from "../../lib/review-storage";
import { loadStoredSetup, type StoredSetup } from "../../lib/storage";
import { EvidenceBadge } from "./EvidenceBadge";
import { MapView } from "./MapView";
import { TimeControls } from "./TimeControls";
import { type WorldCameraMode, WorldView } from "./WorldView";

type ViewMode = WorldCameraMode | "map";

const schedule = {
  startMs: -60_000,
  shakingStartMs: 0,
  shakingEndMs: 60_000,
  hazardReplayStartMs: 300_000,
  resolveAtMs: 900_000,
};

function formatSimulationTime(timeMs: number) {
  if (timeMs < 0) {
    return `発災まで ${Math.ceil(Math.abs(timeMs) / 1000)} 秒`;
  }
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `発災後 ${minutes}:${String(seconds).padStart(2, "0")}`;
}

function phaseLabel(phase: SimulationRun["phase"]) {
  return {
    pre_event: "発災前",
    shaking: "強い揺れ",
    evacuation: "避難判断",
    hazard_replay: "津波Replay",
    resolved: "体験終了",
  }[phase];
}

function distanceMeters(
  first: { east: number; north: number },
  second: { east: number; north: number },
) {
  return Math.hypot(first.east - second.east, first.north - second.north);
}

export function SimulationShell() {
  const router = useRouter();
  const [setup, setSetup] = useState<StoredSetup | null>(null);
  const [run, setRun] = useState<SimulationRun | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("fps");
  const [player, setPlayer] = useState({ east: 0, north: 0 });
  const [route, setRoute] = useState([{ east: 0, north: 0 }]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fov, setFov] = useState(65);

  const target = useMemo(
    () =>
      geographicToLocalMeters(DEMO_SCENARIO.center, {
        latitude: DEMO_SCENARIO.evacuationTarget.latitude,
        longitude: DEMO_SCENARIO.evacuationTarget.longitude,
      }),
    [],
  );
  const distance = distanceMeters(player, target);
  const targetReached = distance <= 40;
  const runReady = run !== null;
  const currentPhase = run?.phase ?? null;
  const personPreset = setup?.person ?? null;

  useEffect(() => {
    const stored = loadStoredSetup(window.localStorage);
    if (!stored) {
      router.replace("/setup");
      return;
    }
    setSetup(stored);
    setRun(
      createSimulationRun({
        identity: {
          scenarioId: stored.scenarioId,
          scenarioVersion: "1.0.0-fixture",
          datasetVersions: { "application-owned-fixture": "1.0.0" },
          artifactVersions: { web: "0.1.0" },
          engineVersion: "0.1.0",
          seed: stored.seed,
          initialConditionsHash: `${stored.location.latitude}:${stored.location.longitude}:${stored.timeOfDay}`,
          playerProfileHash: stored.person,
          preparednessProfileHash: JSON.stringify(stored.preparedness),
        },
        schedule,
      }),
    );
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, [router]);

  useEffect(() => {
    if (!runReady) {
      return;
    }
    const timer = window.setInterval(() => {
      setRun((current) =>
        current ? advanceSimulation(current, 100) : current,
      );
    }, 100);
    return () => window.clearInterval(timer);
  }, [runReady]);

  useEffect(() => {
    if (!currentPhase || viewMode === "map") {
      return;
    }

    function keyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (
        ![
          "w",
          "a",
          "s",
          "d",
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
        ].includes(key)
      ) {
        return;
      }
      event.preventDefault();
      const baseStep = currentPhase === "shaking" ? 0.75 : 7;
      const step = personPreset === "older_adult" ? baseStep * 0.7 : baseStep;
      const delta = { east: 0, north: 0 };
      if (key === "w" || key === "arrowup") delta.north += step;
      if (key === "s" || key === "arrowdown") delta.north -= step;
      if (key === "d" || key === "arrowright") delta.east += step;
      if (key === "a" || key === "arrowleft") delta.east -= step;
      setPlayer((current) => {
        const next = {
          east: current.east + delta.east,
          north: current.north + delta.north,
        };
        setRoute((currentRoute) => [...currentRoute, next]);
        return next;
      });
    }

    window.addEventListener("keydown", keyDown);
    return () => window.removeEventListener("keydown", keyDown);
  }, [currentPhase, personPreset, viewMode]);

  if (!setup || !run) {
    return (
      <main className="simulation-loading">体験条件を読み込んでいます…</main>
    );
  }

  const activeSetup = setup;
  const activeRun = run;
  const lastEvent = activeRun.events.at(-1);
  const replayActive =
    activeRun.phase === "hazard_replay" || activeRun.phase === "resolved";

  function setScale(scale: TimeScale) {
    setRun((current) => (current ? setTimeScale(current, scale) : current));
  }

  function moveFromMap(position: { east: number; north: number }) {
    setPlayer(position);
    setRoute((current) => [...current, position]);
  }

  function finish() {
    saveStoredReview(window.sessionStorage, {
      version: 1,
      setup: activeSetup,
      seed: activeSetup.seed,
      elapsedSimulationMs: activeRun.simulationTimeMs,
      targetReached,
      targetDistanceMeters: distance,
      events: activeRun.events,
      route,
      injuryState: activeRun.injuryState,
    });
    router.push("/review");
  }

  return (
    <main className={`simulation-shell phase-${activeRun.phase}`}>
      <header className="simulation-topbar">
        <div>
          <a className="brand-link" href="/">
            防災疑似体験
          </a>
          <span className="training-inline">平時の訓練用</span>
        </div>
        <div className="simulation-clock" aria-live="polite">
          <strong>{formatSimulationTime(activeRun.simulationTimeMs)}</strong>
          <span>{phaseLabel(activeRun.phase)}</span>
        </div>
        <TimeControls value={activeRun.timeScale} onChange={setScale} />
      </header>

      <section className="simulation-stage">
        {viewMode === "map" ? (
          <MapView player={player} onMove={moveFromMap} />
        ) : (
          <WorldView
            mode={viewMode}
            player={player}
            fov={fov}
            reducedMotion={reducedMotion}
            replayActive={replayActive}
            phase={activeRun.phase}
            simulationTimeMs={activeRun.simulationTimeMs}
          />
        )}

        <nav className="view-switch" aria-label="視点切替">
          {(["fps", "tps", "map"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={viewMode === mode ? "active" : undefined}
              onClick={() => setViewMode(mode)}
            >
              {mode === "fps" ? "FPS" : mode === "tps" ? "TPS" : "地図"}
            </button>
          ))}
        </nav>

        <aside className="status-panel">
          <div className="status-section">
            <span className="status-label">避難目標まで</span>
            <strong>{Math.round(distance)} m</strong>
            <span className={targetReached ? "safe-text" : "muted-text"}>
              {targetReached
                ? "デモ避難目標に到達"
                : DEMO_SCENARIO.evacuationTarget.label}
            </span>
          </div>
          <div className="status-section compact-status">
            <span>身体</span>
            <strong>
              {activeRun.injuryState === "none" ? "無傷" : activeRun.injuryState}
            </strong>
            <span>端末</span>
            <strong>
              {activeSetup.preparedness.mobileBattery ? "予備電源あり" : "通常電池"}
            </strong>
          </div>
          {lastEvent ? (
            <div className="status-section event-status">
              <span className="status-label">最新イベント</span>
              <strong>{lastEvent.kind}</strong>
              <EvidenceBadge evidenceClass={lastEvent.evidenceClass} />
            </div>
          ) : null}
        </aside>

        {activeRun.phase === "shaking" ? (
          <div className="hazard-alert" role="alert">
            <strong>強い揺れ</strong>
            <span>
              無理に走らず、姿勢を低くして周囲の落下物に注意してください。
            </span>
          </div>
        ) : null}
        {replayActive ? (
          <div className="hazard-alert tsunami-alert" role="status">
            <strong>津波Replay</strong>
            <span>
              水面の時間変化は演出です。公式な地点別到達時刻ではありません。
            </span>
            <EvidenceBadge evidenceClass="illustrative" />
          </div>
        ) : null}
      </section>

      <footer className="simulation-footer">
        <div className="control-help">
          <strong>
            {viewMode === "map"
              ? "地図をクリックして移動"
              : "WASD / 矢印キーで移動"}
          </strong>
          <span>{DEMO_DATA_NOTICE}</span>
        </div>
        <div className="simulation-settings">
          <label>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(event) => setReducedMotion(event.target.checked)}
            />
            動きを抑える
          </label>
          <label>
            FOV
            <input
              type="range"
              min="45"
              max="90"
              value={fov}
              onChange={(event) => setFov(Number(event.target.value))}
            />
          </label>
        </div>
        <button className="primary-button" type="button" onClick={finish}>
          体験を終了して振り返る
        </button>
      </footer>
    </main>
  );
}
