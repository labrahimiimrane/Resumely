import type { BuiltInSectionKey } from "@/types/cv";

export type EditorSectionId =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "custom";

export type EditorSection = {
  id: EditorSectionId;
  label: string;
  description: string;
  sectionKey?: BuiltInSectionKey;
};

export const EDITOR_SECTIONS: readonly EditorSection[] = [
  {
    id: "personal",
    label: "Personal information",
    description: "Your name, title, and how recruiters can reach you.",
  },
  {
    id: "summary",
    sectionKey: "summary",
    label: "Professional summary",
    description: "Two to four sentences on who you are and the value you bring.",
  },
  {
    id: "experience",
    sectionKey: "experience",
    label: "Experience",
    description: "Most recent role first. Start each bullet with an action verb and a result.",
  },
  {
    id: "education",
    sectionKey: "education",
    label: "Education",
    description: "Degrees and programs, most recent first.",
  },
  {
    id: "skills",
    sectionKey: "skills",
    label: "Skills",
    description: "Group related skills under a short category name.",
  },
  {
    id: "projects",
    sectionKey: "projects",
    label: "Projects",
    description: "Work that shows what you can build, with links where you have them.",
  },
  {
    id: "certifications",
    sectionKey: "certifications",
    label: "Certifications",
    description: "Credentials with the issuing organization and date.",
  },
  {
    id: "languages",
    sectionKey: "languages",
    label: "Languages",
    description: "Languages you speak and your level in each.",
  },
  {
    id: "custom",
    label: "Custom sections",
    description: "Anything else worth a heading, like volunteering or awards.",
  },
];
