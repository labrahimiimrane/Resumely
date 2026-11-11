import { duplicateItem, moveItem } from "@/lib/cv/entries";
import { CUSTOM_SECTION_PREFIX } from "@/lib/validations/cv";
import type { CustomSection, CvDocument, SectionKey } from "@/types/cv";

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

export function duplicateCustomSection(cv: CvDocument, id: string, newId: string): CvDocument {
  const originalKey = `${CUSTOM_SECTION_PREFIX}${id}`;
  const keyIndex = cv.sections.findIndex((section) => section.key === originalKey);
  if (keyIndex === -1 || !cv.customSections.some((section) => section.id === id)) return cv;
  const newKey = { key: `${CUSTOM_SECTION_PREFIX}${newId}` as const, enabled: cv.sections[keyIndex].enabled };
  return {
    ...cv,
    customSections: duplicateItem(cv.customSections, id, "title", newId),
    sections: [...cv.sections.slice(0, keyIndex + 1), newKey, ...cv.sections.slice(keyIndex + 1)],
  };
}

export function moveCustomSection(cv: CvDocument, from: number, to: number): CvDocument {
  const customSections = moveItem(cv.customSections, from, to);
  const enabledByKey = new Map(cv.sections.map((section) => [section.key, section.enabled]));
  const orderedKeys = customSections.map((section) => `${CUSTOM_SECTION_PREFIX}${section.id}` as const);
  let next = 0;
  const sections = cv.sections.map((section) => {
    if (!section.key.startsWith(CUSTOM_SECTION_PREFIX)) return section;
    const key = orderedKeys[next++];
    return { key, enabled: enabledByKey.get(key) ?? true };
  });
  return { ...cv, customSections, sections };
}

export function setSectionEnabled(cv: CvDocument, key: SectionKey, enabled: boolean): CvDocument {
  if (!cv.sections.some((section) => section.key === key)) return cv;
  return {
    ...cv,
    sections: cv.sections.map((section) => (section.key === key ? { ...section, enabled } : section)),
  };
}
