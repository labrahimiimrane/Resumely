"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UndoRedoControls } from "@/components/layout/undo-redo-controls";
import { useCv } from "@/hooks/use-cv";
import { getCvDisplayName } from "@/lib/cv/document";

export function AppHeader() {
  const { cv } = useCv();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4">
      <div className="flex items-center gap-2 text-[15px] font-semibold">
        <span
          aria-hidden="true"
          className="grid size-[26px] place-items-center rounded-[7px] bg-primary text-sm font-bold text-primary-foreground"
        >
          R
        </span>
        Resumely
      </div>
      <span aria-hidden="true" className="h-[22px] w-px bg-border" />
      <p className="min-w-0 truncate text-[13px] font-medium" title={getCvDisplayName(cv)}>
        {getCvDisplayName(cv)}
      </p>
      <div className="flex-1" />
      <UndoRedoControls />
      <span aria-hidden="true" className="h-[22px] w-px bg-border" />
      <ThemeToggle />
    </header>
  );
}
