"use client";

import { useEffect, useRef, type ComponentType } from "react";
import { CertificationsSection } from "@/components/editor/certifications-section";
import { CustomSectionsSection } from "@/components/editor/custom-sections-section";
import { EducationSection } from "@/components/editor/education-section";
import { ExperienceSection } from "@/components/editor/experience-section";
import { LanguagesSection } from "@/components/editor/languages-section";
import { PersonalSection } from "@/components/editor/personal-section";
import { ProjectsSection } from "@/components/editor/projects-section";
import { SkillsSection } from "@/components/editor/skills-section";
import { SummarySection } from "@/components/editor/summary-section";
import type { EditorSection, EditorSectionId } from "@/lib/cv/sections";

const SECTION_FORMS: Record<EditorSectionId, ComponentType> = {
  personal: PersonalSection,
  summary: SummarySection,
  experience: ExperienceSection,
  education: EducationSection,
  skills: SkillsSection,
  projects: ProjectsSection,
  certifications: CertificationsSection,
  languages: LanguagesSection,
  custom: CustomSectionsSection,
};

type SectionPanelProps = {
  section: EditorSection;
  focusOnChange: boolean;
};

export function SectionPanel({ section, focusOnChange }: SectionPanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const SectionForm = SECTION_FORMS[section.id];

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
      <SectionForm key={section.id} />
    </section>
  );
}
