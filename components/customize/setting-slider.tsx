"use client";

import { useId } from "react";

type SettingSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Formats the value for the visible readout and for screen readers, e.g. "10.5 pt". */
  format: (value: number) => string;
  onChange: (value: number) => void;
};

export function SettingSlider({ label, value, min, max, step, format, onChange }: SettingSliderProps) {
  const id = useId();
  const readout = format(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-medium">
          {label}
        </label>
        <span aria-hidden="true" className="font-mono text-xs text-muted-foreground tabular-nums">
          {readout}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={readout}
        onChange={(event) => onChange(event.target.valueAsNumber)}
        className="h-5 w-full cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-full"
      />
    </div>
  );
}
