"use client";

import { useState } from "react";
import { AtsPanel } from "@/components/ats/ats-panel";
import { CustomizePanel } from "@/components/customize/customize-panel";
import { SectionPanel } from "@/components/editor/section-panel";
import { AppHeader } from "@/components/layout/app-header";
import { SectionNav } from "@/components/layout/section-nav";
import { PreviewPanel, usePreviewVisible } from "@/components/preview/preview-panel";
import { CvProvider } from "@/hooks/use-cv";
import { EDITOR_SECTIONS, type EditorSectionId } from "@/lib/cv/sections";

export function EditorWorkspace() {
  const [activeSection, setActiveSection] = useState<EditorSectionId>("personal");
  const [hasNavigated, setHasNavigated] = useState(false);
  const [view, setView] = useState<"editor" | "customize" | "ats">("editor");
  // Memory only: kept across view switches, lost on refresh, never stored or sent.
  const [jobDescription, setJobDescription] = useState("");
  const previewVisible = usePreviewVisible();
  const section = EDITOR_SECTIONS.find((item) => item.id === activeSection) ?? EDITOR_SECTIONS[0];

  function selectSection(id: EditorSectionId) {
    setActiveSection(id);
    setHasNavigated(true);
    setView("editor");
  }

  function backToEditor() {
    setHasNavigated(true);
    setView("editor");
  }

  return (
    <CvProvider>
      <div className="flex h-dvh flex-col">
        <AppHeader onCustomize={() => setView("customize")} />
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <SectionNav
            activeSection={view === "editor" ? activeSection : null}
            onSelect={selectSection}
            atsActive={view === "ats"}
            onSelectAts={() => setView("ats")}
          />
          <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
            <div className="mx-auto max-w-[680px]">
              {view === "customize" ? (
                <CustomizePanel onBack={backToEditor} />
              ) : view === "ats" ? (
                <AtsPanel
                  onNavigate={selectSection}
                  jobDescription={jobDescription}
                  onJobDescriptionChange={setJobDescription}
                />
              ) : (
                <SectionPanel section={section} focusOnChange={hasNavigated} />
              )}
            </div>
          </main>
          {previewVisible ? <PreviewPanel /> : null}
        </div>
      </div>
    </CvProvider>
  );
}
