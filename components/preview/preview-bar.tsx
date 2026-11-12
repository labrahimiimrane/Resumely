"use client";

import { useId, type ComponentProps } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCv } from "@/hooks/use-cv";
import { PAGE_SIZES } from "@/lib/validations/cv";
import type { PresentationSettings } from "@/types/cv";

type PageSize = PresentationSettings["pageSize"];

type PreviewBarProps = {
  zoomLabel: string;
  onZoomIn: (() => void) | null;
  onZoomOut: (() => void) | null;
  currentPage: number;
  pageCount: number;
  onPreviousPage: (() => void) | null;
  onNextPage: (() => void) | null;
};

export function PreviewBar({
  zoomLabel,
  onZoomIn,
  onZoomOut,
  currentPage,
  pageCount,
  onPreviousPage,
  onNextPage,
}: PreviewBarProps) {
  const { cv, updateCv } = useCv();
  const name = useId();
  const current = cv.settings.pageSize;

  const select = (next: PageSize) => {
    if (next === current) return;
    updateCv((doc) => ({ ...doc, settings: { ...doc.settings, pageSize: next } }));
  };

  return (
    <div className="flex h-12 shrink-0 items-center justify-end gap-2 border-b bg-card px-3">
      <div role="group" aria-label="Zoom" className="inline-flex items-center gap-0.5">
        <BarButton label="Zoom out" onAction={onZoomOut}>
          <Minus aria-hidden="true" />
        </BarButton>
        <span aria-live="polite" aria-atomic="true" className={readoutClass}>
          {zoomLabel}
        </span>
        <BarButton label="Zoom in" onAction={onZoomIn}>
          <Plus aria-hidden="true" />
        </BarButton>
      </div>

      <span aria-hidden="true" className="h-5 w-px bg-border" />

      <div role="group" aria-label="Page navigation" className="inline-flex items-center gap-0.5">
        <BarButton label="Previous page" onAction={onPreviousPage}>
          <ChevronLeft aria-hidden="true" />
        </BarButton>
        <span aria-live="polite" aria-atomic="true" className={readoutClass}>
          <span aria-hidden="true">
            {currentPage} / {pageCount}
          </span>
          <span className="sr-only">
            Page {currentPage} of {pageCount}
          </span>
        </span>
        <BarButton label="Next page" onAction={onNextPage}>
          <ChevronRight aria-hidden="true" />
        </BarButton>
      </div>

      {/* Native radios: an exclusive choice with built-in keyboard support, and no aria-pressed,
          which the undo shortcut treats as an in-progress drag. */}
      <fieldset className="ml-1 inline-flex gap-0.5 rounded-md bg-muted p-[3px]">
        <legend className="sr-only">Page size</legend>
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
      </fieldset>
    </div>
  );
}

const readoutClass = "min-w-[42px] text-center font-mono text-xs text-muted-foreground tabular-nums";

type BarButtonProps = {
  label: string;
  onAction: (() => void) | null;
  children: ComponentProps<typeof Button>["children"];
};

// focusableWhenDisabled keeps keyboard focus on a button that hits a limit. It sets
// aria-disabled instead of the native attribute, so the disabled look is restyled here.
function BarButton({ label, onAction, children }: BarButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      disabled={!onAction}
      focusableWhenDisabled
      onClick={() => onAction?.()}
      className="aria-disabled:cursor-default aria-disabled:opacity-50 aria-disabled:hover:bg-transparent aria-disabled:active:translate-y-0"
    >
      {children}
    </Button>
  );
}
