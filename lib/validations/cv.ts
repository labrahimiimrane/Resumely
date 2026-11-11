import { z } from "zod";

export const CV_SCHEMA_VERSION = 1;

export const SHORT_TEXT_MAX = 200;
export const LONG_TEXT_MAX = 5000;
export const BULLET_MAX = 1000;
export const URL_MAX = 2048;
export const LIST_MAX = 50;
export const ID_MAX = 100;
export const PHOTO_MAX = 700_000;

export const BUILT_IN_SECTION_KEYS = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
] as const;

export const CUSTOM_SECTION_PREFIX = "custom:";

export const TEMPLATE_IDS = [
  "professional",
  "modern",
  "executive",
  "developer",
  "minimal",
  "compact",
] as const;

export const FONT_FAMILIES = ["geist", "inter", "georgia", "arial"] as const;

export const PAGE_SIZES = ["A4", "Letter"] as const;

export const CV_DATE_PATTERN = /^(\d{4}(-(0[1-9]|1[0-2]))?)?$/;
const URL_SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;
const SAFE_URL_SCHEME_PATTERN = /^https?:/i;
// Browsers ignore whitespace and control characters inside schemes, so
// "java\tscript:" or " javascript:" must be judged without them.
const IGNORED_URL_CHARS = /[\u0000- \u007f]/g;
const PHOTO_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

const shortText = z.string().max(SHORT_TEXT_MAX);
const longText = z.string().max(LONG_TEXT_MAX);

export const shortTextSchema = shortText;
export const longTextSchema = longText;
const bulletList = z.array(z.string().max(BULLET_MAX)).max(LIST_MAX);
const shortTextList = z.array(shortText).max(LIST_MAX);
const id = z.string().min(1).max(ID_MAX);

const cvDate = z
  .string()
  .regex(CV_DATE_PATTERN, "Use YYYY or YYYY-MM");

const safeUrl = z
  .string()
  .max(URL_MAX)
  .refine((value) => {
    const compact = value.replace(IGNORED_URL_CHARS, "");
    return !URL_SCHEME_PATTERN.test(compact) || SAFE_URL_SCHEME_PATTERN.test(compact);
  }, "Links must use http or https");

const photo = z
  .string()
  .max(PHOTO_MAX, "Photo is too large")
  .refine(
    (value) => value === "" || PHOTO_PATTERN.test(value),
    "Photo must be a JPEG, PNG, or WebP image",
  );

const hexColor = z.string().regex(HEX_COLOR_PATTERN, "Use a #RRGGBB color");

export const personalSchema = z.object({
  fullName: shortText,
  title: shortText,
  email: shortText,
  phone: shortText,
  location: shortText,
  linkedinUrl: safeUrl,
  portfolioUrl: safeUrl,
  githubUrl: safeUrl,
  photo,
  showPhoto: z.boolean(),
});

export const experienceEntrySchema = z.object({
  id,
  enabled: z.boolean(),
  company: shortText,
  jobTitle: shortText,
  location: shortText,
  startDate: cvDate,
  endDate: cvDate,
  current: z.boolean(),
  responsibilities: bulletList,
  achievements: bulletList,
});

export const educationEntrySchema = z.object({
  id,
  enabled: z.boolean(),
  institution: shortText,
  degree: shortText,
  fieldOfStudy: shortText,
  startDate: cvDate,
  endDate: cvDate,
  description: longText,
});

export const skillGroupSchema = z.object({
  id,
  enabled: z.boolean(),
  name: shortText,
  skills: shortTextList,
});

export const projectEntrySchema = z.object({
  id,
  enabled: z.boolean(),
  name: shortText,
  description: longText,
  technologies: shortTextList,
  projectUrl: safeUrl,
  githubUrl: safeUrl,
});

export const certificationEntrySchema = z.object({
  id,
  enabled: z.boolean(),
  name: shortText,
  issuer: shortText,
  issueDate: cvDate,
  credentialUrl: safeUrl,
});

export const languageEntrySchema = z.object({
  id,
  enabled: z.boolean(),
  language: shortText,
  proficiency: shortText,
});

export const customSectionSchema = z.object({
  id,
  title: shortText,
  content: longText,
});

export const presentationSettingsSchema = z.object({
  template: z.enum(TEMPLATE_IDS),
  fontFamily: z.enum(FONT_FAMILIES),
  fontSize: z.number().min(9).max(13),
  lineHeight: z.number().min(1).max(2),
  primaryColor: hexColor,
  textColor: hexColor,
  sectionSpacing: z.number().min(4).max(32),
  pageMargin: z.number().min(10).max(30),
  pageSize: z.enum(PAGE_SIZES),
});

const sectionStateInputSchema = z.object({
  key: z.string().max(CUSTOM_SECTION_PREFIX.length + ID_MAX),
  enabled: z.boolean(),
});

export type BuiltInSectionKey = (typeof BUILT_IN_SECTION_KEYS)[number];
export type SectionKey = BuiltInSectionKey | `custom:${string}`;
export type SectionState = { key: SectionKey; enabled: boolean };

const ENTRY_LISTS = [
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "customSections",
] as const;

function normalizeSections(
  sections: { key: string; enabled: boolean }[],
  customSections: { id: string }[],
): SectionState[] {
  const validKeys = new Set<string>([
    ...BUILT_IN_SECTION_KEYS,
    ...customSections.map((section) => CUSTOM_SECTION_PREFIX + section.id),
  ]);
  const result: SectionState[] = [];
  const seen = new Set<string>();

  for (const section of sections) {
    if (!validKeys.has(section.key) || seen.has(section.key)) continue;
    seen.add(section.key);
    result.push({ key: section.key as SectionKey, enabled: section.enabled });
  }

  const missing = [
    ...BUILT_IN_SECTION_KEYS,
    ...customSections.map((section) => `${CUSTOM_SECTION_PREFIX}${section.id}` as const),
  ].filter((key) => !seen.has(key));

  for (const key of missing) {
    result.push({ key, enabled: true });
  }

  return result;
}

export const cvDocumentSchema = z
  .object({
    version: z.literal(CV_SCHEMA_VERSION),
    name: shortText,
    personal: personalSchema,
    summary: longText,
    experience: z.array(experienceEntrySchema).max(LIST_MAX),
    education: z.array(educationEntrySchema).max(LIST_MAX),
    skills: z.array(skillGroupSchema).max(LIST_MAX),
    projects: z.array(projectEntrySchema).max(LIST_MAX),
    certifications: z.array(certificationEntrySchema).max(LIST_MAX),
    languages: z.array(languageEntrySchema).max(LIST_MAX),
    customSections: z.array(customSectionSchema).max(LIST_MAX),
    sections: z
      .array(sectionStateInputSchema)
      .max(BUILT_IN_SECTION_KEYS.length + LIST_MAX * 2),
    settings: presentationSettingsSchema,
  })
  .superRefine((cv, ctx) => {
    const seen = new Set<string>();
    for (const list of ENTRY_LISTS) {
      cv[list].forEach((entry, index) => {
        if (seen.has(entry.id)) {
          ctx.addIssue({
            code: "custom",
            message: "Duplicate id",
            path: [list, index, "id"],
          });
        }
        seen.add(entry.id);
      });
    }
  })
  .transform((cv) => ({
    ...cv,
    sections: normalizeSections(cv.sections, cv.customSections),
  }));
