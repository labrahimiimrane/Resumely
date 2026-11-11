"use client";

import { EDITOR_SECTIONS, type EditorSectionId } from "@/lib/cv/sections";
import { cn } from "@/lib/utils";

type SectionNavProps = {
  activeSection: EditorSectionId;
  onSelect: (id: EditorSectionId) => void;
};

export function SectionNav({ activeSection, onSelect }: SectionNavProps) {
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
          return (
            <li key={section.id} className="shrink-0">
              <button
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelect(section.id)}
                className={cn(
                  "w-full rounded-md border px-3 py-1.5 text-left text-[13px] whitespace-nowrap text-sidebar-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                  "lg:border-transparent lg:px-2 lg:py-[7px]",
                  isActive &&
                    "border-transparent bg-sidebar-accent font-medium text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                {section.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
