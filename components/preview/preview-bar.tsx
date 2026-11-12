"use client";

import type { ComponentProps } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { PageSizeToggle } from "@/components/preview/page-size-toggle";
import { Button } from "@/components/ui/button";

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

      <PageSizeToggle className="ml-1" />
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
