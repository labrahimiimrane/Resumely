"use client";

import { cn } from "@/lib/utils";

const MONTHS = [
  ["01", "Jan"],
  ["02", "Feb"],
  ["03", "Mar"],
  ["04", "Apr"],
  ["05", "May"],
  ["06", "Jun"],
  ["07", "Jul"],
  ["08", "Aug"],
  ["09", "Sep"],
  ["10", "Oct"],
  ["11", "Nov"],
  ["12", "Dec"],
] as const;

const controlClass =
  "h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30";

type DateFieldProps = {
  id: string;
  legend: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  describedBy?: string;
};

function splitDate(value: string) {
  const separator = value.indexOf("-");
  if (separator === -1) return { year: value, month: "" };
  return { year: value.slice(0, separator), month: value.slice(separator + 1) };
}

export function DateField({ id, legend, value, onChange, onBlur, disabled, error, describedBy }: DateFieldProps) {
  const { year, month } = splitDate(value);
  const errorId = error ? `${id}-error` : undefined;
  const describedByIds = [errorId, describedBy].filter(Boolean).join(" ") || undefined;
  const compose = (nextYear: string, nextMonth: string) => nextYear + (nextMonth ? `-${nextMonth}` : "");

  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5" disabled={disabled}>
      <legend className="mb-1.5 text-[13px] font-medium">{legend}</legend>
      <div className="flex gap-2">
        <label htmlFor={`${id}-month`} className="sr-only">
          {legend} month
        </label>
        <select
          id={`${id}-month`}
          value={disabled ? "" : month}
          aria-invalid={error ? true : undefined}
          onChange={(event) => onChange(compose(year, event.target.value))}
          onBlur={onBlur}
          className={cn(controlClass, "w-[5.5rem] shrink-0")}
        >
          <option value="">Month</option>
          {MONTHS.map(([number, name]) => (
            <option key={number} value={number}>
              {name}
            </option>
          ))}
        </select>
        <label htmlFor={`${id}-year`} className="sr-only">
          {legend} year
        </label>
        <input
          id={`${id}-year`}
          inputMode="numeric"
          maxLength={4}
          placeholder="Year"
          autoComplete="off"
          value={disabled ? "Present" : year}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedByIds}
          onChange={(event) => onChange(compose(event.target.value.replace(/\D/g, ""), month))}
          onBlur={onBlur}
          className={cn(controlClass, "w-full min-w-0 placeholder:text-muted-foreground")}
        />
      </div>
      {error ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
