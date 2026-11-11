import { CUSTOM_SECTION_PREFIX } from "@/lib/validations/cv";
import type { CustomSection, CvDocument } from "@/types/cv";

export function addCustomSection(cv: CvDocument, section: CustomSection): CvDocument {
  return {
    ...cv,
    customSections: [...cv.customSections, section],
    sections: [...cv.sections, { key: `${CUSTOM_SECTION_PREFIX}${section.id}` as const, enabled: true }],
  };
}

export function removeCustomSection(cv: CvDocument, id: string): CvDocument {
  const key = `${CUSTOM_SECTION_PREFIX}${id}`;
  return {
    ...cv,
    customSections: cv.customSections.filter((section) => section.id !== id),
    sections: cv.sections.filter((section) => section.key !== key),
  };
}
