"use client";

import { useCv } from "@/hooks/use-cv";
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

type SectionNavProps = {
  activeSection: EditorSectionId;
  onSelect: (id: EditorSectionId) => void;
};

export function SectionNav({ activeSection, onSelect }: SectionNavProps) {
  const { cv } = useCv();

  return (
    <nav
      aria-label="CV sections"
      className="shrink-0 border-b bg-sidebar lg:w-[236px] lg:overflow-y-auto lg:border-r lg:border-b-0"
    >
      <p className="hidden px-5 pt-5 pb-1 text-xs font-medium tracking-wider text-faint uppercase lg:block">
        Content
      </p>
      <ul className="flex gap-1.5 overflow-x-auto px-4 py-3 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-3 lg:py-1">
        {EDITOR_SECTIONS.map((section) => {
          const isActive = section.id === activeSection;
          const count = entryCount(cv, section.id);
          return (
            <li key={section.id} className="shrink-0">
              <button
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelect(section.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md border px-3 py-1.5 text-left text-[13px] whitespace-nowrap text-sidebar-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                  "lg:border-transparent lg:px-2 lg:py-[7px]",
                  isActive &&
                    "border-transparent bg-sidebar-accent font-medium text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
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
    </nav>
  );
}
