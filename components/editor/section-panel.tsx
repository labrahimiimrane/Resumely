"use client";

import { useEffect, useRef } from "react";
import { FileText } from "lucide-react";
import { PersonalSection } from "@/components/editor/personal-section";
import { SummarySection } from "@/components/editor/summary-section";
import type { EditorSection } from "@/lib/cv/sections";

type SectionPanelProps = {
  section: EditorSection;
  focusOnChange: boolean;
};

export function SectionPanel({ section, focusOnChange }: SectionPanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusOnChange) headingRef.current?.focus();
  }, [section.id, focusOnChange]);

  return (
    <section aria-labelledby={`section-${section.id}-heading`} className="flex flex-col gap-4">
      <div>
        <h1
          id={`section-${section.id}-heading`}
          ref={headingRef}
          tabIndex={-1}
          className="rounded-sm text-[22px] font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {section.label}
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">{section.description}</p>
      </div>
      {section.id === "personal" ? (
        <PersonalSection />
      ) : section.id === "summary" ? (
        <SummarySection />
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-[10px] border border-dashed border-input bg-card px-6 py-12 text-center">
          <FileText aria-hidden="true" className="size-6 text-faint" />
          <p className="text-sm font-medium">Nothing here yet</p>
          <p className="max-w-sm text-[13px] text-muted-foreground">
            Editing for this section is on its way.
          </p>
        </div>
      )}
    </section>
  );
}
