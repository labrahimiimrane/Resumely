"use client";

import { useState } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { AtsPanel } from "@/components/ats/ats-panel";
import { CustomizePanel } from "@/components/customize/customize-panel";
import { SectionPanel } from "@/components/editor/section-panel";
import { AppHeader } from "@/components/layout/app-header";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { SectionNav } from "@/components/layout/section-nav";
import { TemplateSelector } from "@/components/layout/template-selector";
import { PreviewPanel } from "@/components/preview/preview-panel";
import { CvProvider } from "@/hooks/use-cv";
import { NARROW_QUERY, useMediaQuery, WIDE_QUERY } from "@/hooks/use-media-query";
import { EDITOR_SECTIONS, type EditorSectionId } from "@/lib/cv/sections";

type WorkspaceTab = "edit" | "preview";

const TAB =
  "rounded-[7px] px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-active:bg-card data-active:text-foreground data-active:shadow-sm";

export function EditorWorkspace() {
  const [activeSection, setActiveSection] = useState<EditorSectionId>("personal");
  const [hasNavigated, setHasNavigated] = useState(false);
  const [view, setView] = useState<"editor" | "customize" | "ats">("editor");
  // Memory only, like the job description: the compact-layout tab, kept across resizes.
  const [tab, setTab] = useState<WorkspaceTab>("edit");
  // Memory only: kept across view switches, lost on refresh, never stored or sent.
  const [jobDescription, setJobDescription] = useState("");
  const wide = useMediaQuery(WIDE_QUERY);
  const narrow = useMediaQuery(NARROW_QUERY);
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

  function openCustomize() {
    setTab("edit");
    setView("customize");
  }

  const editArea = (
    <>
      <SectionNav
        activeSection={view === "editor" ? activeSection : null}
        onSelect={selectSection}
        atsActive={view === "ats"}
        onSelectAts={() => setView("ats")}
        jobDescription={jobDescription}
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
    </>
  );

  return (
    <CvProvider
      fallback={
        <div role="status" className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
          Loading your CV…
        </div>
      }
    >
      <div className="flex h-dvh flex-col">
        <AppHeader onCustomize={openCustomize} narrow={narrow} />
        {wide ? (
          <div className="flex min-h-0 flex-1 flex-row">
            {editArea}
            <PreviewPanel />
          </div>
        ) : (
          <Tabs.Root
            value={tab}
            onValueChange={(value) => setTab(value === "preview" ? "preview" : "edit")}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="shrink-0 border-b bg-card px-4 py-2">
              <Tabs.List
                aria-label="Workspace view"
                className="mx-auto grid max-w-sm grid-cols-2 rounded-md bg-muted p-[3px]"
              >
                <Tabs.Tab value="edit" className={TAB}>
                  Edit
                </Tabs.Tab>
                <Tabs.Tab value="preview" className={TAB}>
                  Preview
                </Tabs.Tab>
              </Tabs.List>
            </div>
            {/* Kept mounted while hidden so in-progress (even invalid) field values survive a tab switch. */}
            <Tabs.Panel value="edit" keepMounted className="flex min-h-0 flex-1 flex-col outline-none lg:flex-row">
              {editArea}
            </Tabs.Panel>
            {/* Mounted only while shown: pagination measures rendered elements. */}
            <Tabs.Panel value="preview" className="flex min-h-0 flex-1 flex-col outline-none">
              {narrow ? (
                <div className="flex shrink-0 items-center justify-center border-b bg-card px-4 py-2">
                  <TemplateSelector showLabel />
                </div>
              ) : null}
              <PreviewPanel fill />
            </Tabs.Panel>
            {narrow ? <MobileActionBar tab={tab} onCustomize={openCustomize} /> : null}
          </Tabs.Root>
        )}
      </div>
    </CvProvider>
  );
}
