import type { SimulationEvent } from "@disaster-sim/domain";

import { EvidenceBadge } from "../simulation/EvidenceBadge";

function formatTime(timeMs: number) {
  if (timeMs < 0) return `発災 ${Math.ceil(Math.abs(timeMs) / 1000)}秒前`;
  const seconds = Math.floor(timeMs / 1000);
  return `発災後 ${Math.floor(seconds / 60)}分${seconds % 60}秒`;
}

const eventLabels: Record<SimulationEvent["kind"], string> = {
  earthquake_started: "地震発生",
  evacuation_started: "強い揺れの主要区間終了・避難フェーズ開始",
  tsunami_visualization_started: "津波Replay表示開始",
  scenario_resolved: "シナリオ時間終了",
};

export function Timeline({ events }: { events: SimulationEvent[] }) {
  return (
    <ol className="review-timeline">
      {events.length === 0 ? (
        <li className="timeline-empty">記録されたイベントはありません。</li>
      ) : (
        events.map((event) => (
          <li key={event.eventId}>
            <time>{formatTime(event.timeMs)}</time>
            <div>
              <strong>{eventLabels[event.kind]}</strong>
              <span>{event.authoritative ? "評価に使用可能なイベント" : "表示・演出イベント"}</span>
            </div>
            <EvidenceBadge evidenceClass={event.evidenceClass} />
          </li>
        ))
      )}
    </ol>
  );
}
