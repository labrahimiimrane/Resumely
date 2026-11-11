import type { ComponentType } from "react";
import { ProfessionalTemplate } from "@/components/templates/professional-template";
import type { TemplateProps } from "@/components/templates/template-props";
import type { PresentationSettings } from "@/types/cv";

type TemplateId = PresentationSettings["template"];

export const TEMPLATES: Partial<Record<TemplateId, ComponentType<TemplateProps>>> = {
  professional: ProfessionalTemplate,
};

export function resolveTemplate(id: TemplateId): { Template: ComponentType<TemplateProps>; available: boolean } {
  const Template = TEMPLATES[id];
  return Template ? { Template, available: true } : { Template: ProfessionalTemplate, available: false };
}
