"use client";

import { SlidersHorizontal } from "lucide-react";
import { DownloadPdfButton } from "@/components/layout/download-pdf-button";
import { UndoRedoControls } from "@/components/layout/undo-redo-controls";
import { Button } from "@/components/ui/button";

type MobileActionBarProps = {
  tab: "edit" | "preview";
  onCustomize: () => void;
};

/** Narrow-screen bottom bar; holds the header controls that do not fit a phone-width header. */
export function MobileActionBar({ tab, onCustomize }: MobileActionBarProps) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-t bg-card px-4 py-3">
      {tab === "edit" ? (
        <UndoRedoControls inBar />
      ) : (
        // No aria-pressed: the undo shortcut treats a focused aria-pressed="true" element as a drag.
        <Button variant="outline" size="sm" onClick={onCustomize} className="h-10">
          <SlidersHorizontal aria-hidden="true" />
          Customize
        </Button>
      )}
      <DownloadPdfButton inBar />
    </div>
  );
}
