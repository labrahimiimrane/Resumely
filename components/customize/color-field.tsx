"use client";

import { useId, useState, type CSSProperties } from "react";
import { Check } from "lucide-react";
import { TextField } from "@/components/editor/text-field";
import { HEX_COLOR_PATTERN } from "@/lib/validations/cv";

export type Swatch = { name: string; value: string };

type ColorFieldProps = {
  label: string;
  value: string;
  swatches: readonly Swatch[];
  /** typing is true for hex edits, so a burst of keystrokes forms one undo step; swatch picks are discrete. */
  onChange: (value: string, typing: boolean) => void;
};

export function ColorField({ label, value, swatches, onChange }: ColorFieldProps) {
  const name = useId();
  const hexId = useId();
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  const [touched, setTouched] = useState(false);

  // A stored change from a swatch, undo, or redo replaces the draft and clears any error.
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
    setTouched(false);
  }

  const invalid = !HEX_COLOR_PATTERN.test(draft);
  const current = value.toLowerCase();

  function edit(next: string) {
    setDraft(next);
    if (HEX_COLOR_PATTERN.test(next)) {
      setSynced(next);
      onChange(next, true);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[13px] font-medium">{label}</legend>
        <div className="flex flex-wrap gap-2">
          {swatches.map((swatch) => {
            const checked = swatch.value === current;
            return (
              <label
                key={swatch.value}
                title={swatch.name}
                style={{ "--swatch": swatch.value } as CSSProperties}
                className="grid size-8 cursor-pointer place-items-center rounded-full border border-black/10 bg-[var(--swatch)] text-white ring-offset-2 ring-offset-background transition-shadow has-checked:ring-2 has-checked:ring-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50 dark:border-white/20"
              >
                <input
                  type="radio"
                  name={name}
                  value={swatch.value}
                  checked={checked}
                  onChange={() => onChange(swatch.value, false)}
                  className="sr-only"
                />
                <span className="sr-only">{swatch.name}</span>
                {checked ? <Check aria-hidden="true" className="size-4" /> : null}
              </label>
            );
          })}
        </div>
      </fieldset>
      <TextField
        id={hexId}
        label={`${label} hex`}
        value={draft}
        placeholder="#RRGGBB"
        spellCheck={false}
        autoComplete="off"
        maxLength={7}
        error={invalid && touched ? "Use a #RRGGBB color" : undefined}
        onChange={(event) => edit(event.target.value.trim())}
        onBlur={() => setTouched(true)}
        className="max-w-[200px]"
      />
    </div>
  );
}
