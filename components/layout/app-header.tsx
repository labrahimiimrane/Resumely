"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateSelector } from "@/components/layout/template-selector";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UndoRedoControls } from "@/components/layout/undo-redo-controls";
import { useCv } from "@/hooks/use-cv";
import { getCvDisplayName } from "@/lib/cv/document";

type AppHeaderProps = {
  onCustomize: () => void;
};

export function AppHeader({ onCustomize }: AppHeaderProps) {
  const { cv } = useCv();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-4 sm:gap-3">
      <div className="flex items-center gap-2 text-[15px] font-semibold">
        <span
          aria-hidden="true"
          className="grid size-[26px] place-items-center rounded-[7px] bg-primary text-sm font-bold text-primary-foreground"
        >
          R
        </span>
        <span className="max-sm:sr-only">Resumely</span>
      </div>
      <span aria-hidden="true" className="h-[22px] w-px bg-border" />
      <p className="min-w-0 truncate text-[13px] font-medium" title={getCvDisplayName(cv)}>
        {getCvDisplayName(cv)}
      </p>
      <div className="flex-1" />
      <UndoRedoControls />
      <span aria-hidden="true" className="h-[22px] w-px bg-border" />
      <TemplateSelector />
      {/* No aria-pressed: the undo shortcut treats a focused aria-pressed="true" element as a drag. */}
      <Button variant="outline" size="sm" onClick={onCustomize} className="h-[34px]">
        <SlidersHorizontal aria-hidden="true" />
        <span className="max-sm:sr-only">Customize</span>
      </Button>
      <ThemeToggle />
    </header>
  );
}
