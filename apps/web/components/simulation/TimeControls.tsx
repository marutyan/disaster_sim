import type { TimeScale } from "@disaster-sim/domain";

const scales = [0, 1, 2, 5, 10] as const;

export function TimeControls({
  value,
  onChange,
}: {
  value: TimeScale;
  onChange: (scale: TimeScale) => void;
}) {
  return (
    <fieldset className="segmented-control" aria-label="シミュレーション速度">
      {scales.map((scale) => (
        <button
          key={scale}
          type="button"
          className={value === scale ? "active" : undefined}
          aria-pressed={value === scale}
          onClick={() => onChange(scale)}
        >
          {scale === 0 ? "停止" : `${scale}×`}
        </button>
      ))}
    </fieldset>
  );
}
