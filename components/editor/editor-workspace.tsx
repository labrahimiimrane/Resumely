"use client";

import { useState } from "react";
import { SectionPanel } from "@/components/editor/section-panel";
import { AppHeader } from "@/components/layout/app-header";
import { SectionNav } from "@/components/layout/section-nav";
import { CvProvider } from "@/hooks/use-cv";
import { EDITOR_SECTIONS, type EditorSectionId } from "@/lib/cv/sections";

export function EditorWorkspace() {
  const [activeSection, setActiveSection] = useState<EditorSectionId>("personal");
  const [hasNavigated, setHasNavigated] = useState(false);
  const section = EDITOR_SECTIONS.find((item) => item.id === activeSection) ?? EDITOR_SECTIONS[0];

  function selectSection(id: EditorSectionId) {
    setActiveSection(id);
    setHasNavigated(true);
  }

  return (
    <CvProvider>
      <div className="flex h-dvh flex-col">
        <AppHeader />
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <SectionNav activeSection={activeSection} onSelect={selectSection} />
          <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
            <div className="mx-auto max-w-[680px]">
              <SectionPanel section={section} focusOnChange={hasNavigated} />
            </div>
          </main>
        </div>
      </div>
    </CvProvider>
  );
}
