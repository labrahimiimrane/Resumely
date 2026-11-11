import { z } from "zod";
import {
  SHORT_TEXT_MAX,
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

export type PersonalFormValues = z.infer<typeof personalFormSchema>;
export type SummaryFormValues = z.infer<typeof summaryFormSchema>;
