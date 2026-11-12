"use client";

import { useEffect, useRef, type ComponentType } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import { CertificationsSection } from "@/components/editor/certifications-section";
import { CustomSectionsSection } from "@/components/editor/custom-sections-section";
import { EducationSection } from "@/components/editor/education-section";
import { ExperienceSection } from "@/components/editor/experience-section";
import { LanguagesSection } from "@/components/editor/languages-section";
import { PersonalSection } from "@/components/editor/personal-section";
import { ProjectsSection } from "@/components/editor/projects-section";
import { SkillsSection } from "@/components/editor/skills-section";
import { SummarySection } from "@/components/editor/summary-section";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCv } from "@/hooks/use-cv";
import { setSectionEnabled } from "@/lib/cv/custom-sections";
import type { EditorSection, EditorSectionId } from "@/lib/cv/sections";
import { SECTION_TIPS } from "@/lib/writing/tips";

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

// Single-form sections remount on undo/redo; list sections keep their card state and remount each entry form instead.
const STATIC_SECTIONS = new Set<EditorSectionId>(["personal", "summary"]);

type SectionPanelProps = {
  section: EditorSection;
  focusOnChange: boolean;
};

export function SectionPanel({ section, focusOnChange }: SectionPanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const SectionForm = SECTION_FORMS[section.id];
  const { cv, updateCv, revision } = useCv();
  const sectionKey = section.sectionKey;
  const shown = sectionKey ? (cv.sections.find((item) => item.key === sectionKey)?.enabled ?? true) : true;
  const switchId = `section-${section.id}-visible`;

  useEffect(() => {
    if (focusOnChange) headingRef.current?.focus();
  }, [section.id, focusOnChange]);

  return (
    <section aria-labelledby={`section-${section.id}-heading`} className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1
            id={`section-${section.id}-heading`}
            ref={headingRef}
            tabIndex={-1}
            className="rounded-sm text-[22px] font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {section.label}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">{section.description}</p>
          {!shown ? (
            <p className="mt-1 text-[13px] font-medium text-muted-foreground">
              Hidden from your CV. Your content is kept.
            </p>
          ) : null}
        </div>
        {sectionKey ? (
          <div className="flex shrink-0 items-center gap-2 pt-1.5">
            <Label htmlFor={switchId} className="text-[13px] font-normal text-muted-foreground">
              Show on CV
            </Label>
            <Switch
              id={switchId}
              checked={shown}
              aria-label={`Show ${section.label} on CV`}
              onCheckedChange={(enabled) => updateCv((current) => setSectionEnabled(current, sectionKey, enabled))}
            />
          </div>
        ) : null}
      </div>
      <details key={section.id} className="group rounded-[10px] border border-dashed bg-background">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-[10px] px-3 py-2 text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
          <Lightbulb aria-hidden="true" className="size-3.5 text-primary" />
          Writing tips
          <ChevronDown aria-hidden="true" className="ml-auto size-3.5 transition-transform group-open:rotate-180" />
        </summary>
        <ul className="flex list-disc flex-col gap-1 px-3 pb-3 pl-7 text-xs leading-relaxed text-muted-foreground">
          {SECTION_TIPS[section.id].map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </details>
      <SectionForm key={STATIC_SECTIONS.has(section.id) ? `${section.id}:${revision}` : section.id} />
    </section>
  );
}
