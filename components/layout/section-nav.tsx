"use client";

import { useMemo } from "react";
import { useCv } from "@/hooks/use-cv";
import { analyzeCv } from "@/lib/ats/analyze";
import { EDITOR_SECTIONS, type EditorSectionId } from "@/lib/cv/sections";
import type { CvDocument } from "@/types/cv";
import { cn } from "@/lib/utils";

const LIST_SECTIONS: Partial<Record<EditorSectionId, keyof CvDocument>> = {
  experience: "experience",
  education: "education",
  skills: "skills",
  projects: "projects",
  certifications: "certifications",
  languages: "languages",
  custom: "customSections",
};

function entryCount(cv: CvDocument, id: EditorSectionId): number {
  const key = LIST_SECTIONS[id];
  const value = key ? cv[key] : undefined;
  return Array.isArray(value) ? value.length : 0;
}

const GROUP_LABEL = "hidden px-5 pt-5 pb-1 text-xs font-medium tracking-wider text-faint uppercase lg:block";
const LIST = "flex gap-1.5 lg:flex-col lg:gap-1 lg:px-3 lg:py-1";
const ITEM = cn(
  "flex w-full items-center gap-2 rounded-md border px-3 py-1.5 text-left text-[13px] whitespace-nowrap text-sidebar-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
  "lg:border-transparent lg:px-2 lg:py-[7px]",
);
const ITEM_ACTIVE =
  "border-transparent bg-sidebar-accent font-medium text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

type SectionNavProps = {
  /** null while a non-section view (Customize, ATS analysis) is open, so no section is marked current. */
  activeSection: EditorSectionId | null;
  onSelect: (id: EditorSectionId) => void;
  atsActive: boolean;
  onSelectAts: () => void;
};

export function SectionNav({ activeSection, onSelect, atsActive, onSelectAts }: SectionNavProps) {
  const { cv } = useCv();
  const report = useMemo(() => analyzeCv(cv), [cv]);

  return (
    <nav
      aria-label="CV sections"
      className="shrink-0 border-b bg-sidebar lg:w-[236px] lg:overflow-y-auto lg:border-r lg:border-b-0"
    >
      {/* relative: contains the absolutely positioned sr-only text so it cannot widen the page. */}
      <div className="relative flex gap-1.5 overflow-x-auto px-4 py-3 lg:block lg:overflow-visible lg:p-0">
        <p className={GROUP_LABEL}>Content</p>
        <ul className={LIST}>
          {EDITOR_SECTIONS.map((section) => {
            const isActive = section.id === activeSection;
            const count = entryCount(cv, section.id);
            return (
              <li key={section.id} className="shrink-0">
                <button
                  type="button"
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => onSelect(section.id)}
                  className={cn(ITEM, isActive && ITEM_ACTIVE)}
                >
                  {section.label}
                  {count > 0 ? (
                    <span aria-hidden="true" className="ml-auto font-mono text-[11px] text-faint">
                      {count}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
        <p className={cn(GROUP_LABEL, "lg:pt-4")}>Review</p>
        <ul className={cn(LIST, "lg:pb-4")}>
          <li className="shrink-0">
            {/* aria-current, not aria-pressed: the undo shortcut treats a focused aria-pressed="true" element as a drag. */}
            <button
              type="button"
              aria-current={atsActive ? "true" : undefined}
              onClick={onSelectAts}
              className={cn(ITEM, atsActive && ITEM_ACTIVE)}
            >
              ATS analysis
              {report.isEmpty ? null : (
                <>
                  <span className="sr-only">, score {report.score} out of 100</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "ml-auto rounded-full px-[7px] py-px font-mono text-[11px] font-medium",
                      report.score >= 85 && "bg-success-soft text-success",
                      report.score >= 50 && report.score < 85 && "bg-warning-soft text-warning",
                      report.score < 50 && "bg-destructive-soft text-destructive",
                    )}
                  >
                    {report.score}
                  </span>
                </>
              )}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
