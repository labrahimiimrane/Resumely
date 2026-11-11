import { z } from "zod";
import {
  CV_DATE_PATTERN,
  SHORT_TEXT_MAX,
  certificationEntrySchema,
  customSectionSchema,
  educationEntrySchema,
  experienceEntrySchema,
  languageEntrySchema,
  longTextSchema,
  personalSchema,
  projectEntrySchema,
  shortTextSchema,
  skillGroupSchema,
} from "@/lib/validations/cv";

export const EMAIL_ERROR = "Enter a full email address, like name@example.com";

const emailField = z
  .string()
  .max(SHORT_TEXT_MAX)
  .refine((value) => value === "" || z.email().safeParse(value).success, EMAIL_ERROR);

export const personalFormSchema = personalSchema
  .omit({ photo: true, showPhoto: true })
  .extend({
    name: shortTextSchema,
    email: emailField,
  });

export const summaryFormSchema = z.object({
  summary: longTextSchema,
});

export const DATE_ERROR = "Enter a 4-digit year, and pick a month if you like";

const entryDateField = z.string().regex(CV_DATE_PATTERN, DATE_ERROR);

export const experienceFormSchema = experienceEntrySchema
  .omit({ id: true, enabled: true })
  .extend({ startDate: entryDateField, endDate: entryDateField });

export const educationFormSchema = educationEntrySchema
  .omit({ id: true, enabled: true })
  .extend({ startDate: entryDateField, endDate: entryDateField });

export const skillGroupFormSchema = skillGroupSchema.omit({ id: true, enabled: true });

export const projectFormSchema = projectEntrySchema.omit({ id: true, enabled: true });

export const certificationFormSchema = certificationEntrySchema
  .omit({ id: true, enabled: true })
  .extend({ issueDate: entryDateField });

export const languageFormSchema = languageEntrySchema.omit({ id: true, enabled: true });

export const customSectionFormSchema = customSectionSchema.omit({ id: true });

export type PersonalFormValues = z.infer<typeof personalFormSchema>;
export type SummaryFormValues = z.infer<typeof summaryFormSchema>;
export type ExperienceFormValues = z.infer<typeof experienceFormSchema>;
export type EducationFormValues = z.infer<typeof educationFormSchema>;
export type SkillGroupFormValues = z.infer<typeof skillGroupFormSchema>;
export type ProjectFormValues = z.infer<typeof projectFormSchema>;
export type CertificationFormValues = z.infer<typeof certificationFormSchema>;
export type LanguageFormValues = z.infer<typeof languageFormSchema>;
export type CustomSectionFormValues = z.infer<typeof customSectionFormSchema>;
