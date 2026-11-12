"use client";

import { useId } from "react";
import { useCv } from "@/hooks/use-cv";
import { PAGE_SIZES } from "@/lib/validations/cv";
import type { PresentationSettings } from "@/types/cv";

type PageSize = PresentationSettings["pageSize"];

type PageSizeToggleProps = {
  /** Show the "Page size" legend instead of keeping it screen-reader only. */
  showLegend?: boolean;
  className?: string;
};

// Native radios: an exclusive choice with built-in keyboard support, and no aria-pressed,
// which the undo shortcut treats as an in-progress drag.
export function PageSizeToggle({ showLegend = false, className }: PageSizeToggleProps) {
  const { cv, updateCv } = useCv();
  const name = useId();
  const current = cv.settings.pageSize;

  const select = (next: PageSize) => {
    if (next === current) return;
    updateCv((doc) => ({ ...doc, settings: { ...doc.settings, pageSize: next } }));
  };

  return (
    <fieldset className={className}>
      <legend className={showLegend ? "mb-2 text-[13px] font-medium" : "sr-only"}>Page size</legend>
      <div className="inline-flex gap-0.5 rounded-md bg-muted p-[3px]">
        {PAGE_SIZES.map((size) => (
          <label
            key={size}
            className="cursor-pointer rounded-[4px] px-2.5 py-1 font-mono text-xs font-medium text-muted-foreground transition-colors hover:text-foreground has-checked:bg-card has-checked:text-foreground has-checked:shadow-sm has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
          >
            <input
              type="radio"
              name={name}
              value={size}
              checked={current === size}
              onChange={() => select(size)}
              className="sr-only"
            />
            {size}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
