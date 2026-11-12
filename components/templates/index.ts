import type { ComponentType } from "react";
import { CompactTemplate } from "@/components/templates/compact-template";
import { DeveloperTemplate } from "@/components/templates/developer-template";
import { ExecutiveTemplate } from "@/components/templates/executive-template";
import { MinimalTemplate } from "@/components/templates/minimal-template";
import { ModernTemplate } from "@/components/templates/modern-template";
import { ProfessionalTemplate } from "@/components/templates/professional-template";
import type { TemplateProps } from "@/components/templates/template-props";
import type { PresentationSettings } from "@/types/cv";

export type TemplateId = PresentationSettings["template"];

export const TEMPLATES: Record<TemplateId, ComponentType<TemplateProps>> = {
  professional: ProfessionalTemplate,
  modern: ModernTemplate,
  executive: ExecutiveTemplate,
  developer: DeveloperTemplate,
  minimal: MinimalTemplate,
  compact: CompactTemplate,
};

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  professional: "Professional",
  modern: "Modern",
  executive: "Executive",
  developer: "Developer",
  minimal: "Minimal",
  compact: "Compact",
};
