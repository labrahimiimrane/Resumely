import { z } from "zod";
import {
  CV_DATE_PATTERN,
  SHORT_TEXT_MAX,
  educationEntrySchema,
  experienceEntrySchema,
  longTextSchema,
  personalSchema,
  shortTextSchema,
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

export type PersonalFormValues = z.infer<typeof personalFormSchema>;
export type SummaryFormValues = z.infer<typeof summaryFormSchema>;
export type ExperienceFormValues = z.infer<typeof experienceFormSchema>;
export type EducationFormValues = z.infer<typeof educationFormSchema>;
