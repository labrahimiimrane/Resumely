import type { z } from "zod";
import type {
  certificationEntrySchema,
  customSectionSchema,
  cvDocumentSchema,
  educationEntrySchema,
  experienceEntrySchema,
  languageEntrySchema,
  personalSchema,
  presentationSettingsSchema,
  projectEntrySchema,
  skillGroupSchema,
} from "@/lib/validations/cv";

export type {
  BuiltInSectionKey,
  SectionKey,
  SectionState,
} from "@/lib/validations/cv";

export type CvDocument = z.infer<typeof cvDocumentSchema>;
export type CvDocumentInput = z.input<typeof cvDocumentSchema>;
export type PersonalInfo = z.infer<typeof personalSchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;
export type CertificationEntry = z.infer<typeof certificationEntrySchema>;
export type LanguageEntry = z.infer<typeof languageEntrySchema>;
export type CustomSection = z.infer<typeof customSectionSchema>;
export type PresentationSettings = z.infer<typeof presentationSettingsSchema>;
