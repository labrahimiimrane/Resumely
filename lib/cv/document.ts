import { BUILT_IN_SECTION_KEYS, CV_SCHEMA_VERSION } from "@/lib/validations/cv";
import type {
  CertificationEntry,
  CustomSection,
  CvDocument,
  EducationEntry,
  ExperienceEntry,
  LanguageEntry,
  PresentationSettings,
  ProjectEntry,
  SkillGroup,
} from "@/types/cv";

export function createId(): string {
  return crypto.randomUUID();
}

export const DEFAULT_SETTINGS: Readonly<PresentationSettings> = {
  template: "professional",
  fontFamily: "geist",
  fontSize: 10.5,
  lineHeight: 1.4,
  primaryColor: "#2f3b8f",
  textColor: "#1d1d22",
  sectionSpacing: 14,
  pageMargin: 18,
  pageSize: "A4",
};

export function createEmptyCv(): CvDocument {
  return {
    version: CV_SCHEMA_VERSION,
    name: "",
    personal: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      linkedinUrl: "",
      portfolioUrl: "",
      githubUrl: "",
      photo: "",
      showPhoto: false,
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    customSections: [],
    sections: BUILT_IN_SECTION_KEYS.map((key) => ({ key, enabled: true })),
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function createExperienceEntry(): ExperienceEntry {
  return {
    id: createId(),
    enabled: true,
    company: "",
    jobTitle: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    responsibilities: [],
    achievements: [],
  };
}

export function createEducationEntry(): EducationEntry {
  return {
    id: createId(),
    enabled: true,
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    description: "",
  };
}

export function createSkillGroup(): SkillGroup {
  return { id: createId(), enabled: true, name: "", skills: [] };
}

export function createProjectEntry(): ProjectEntry {
  return {
    id: createId(),
    enabled: true,
    name: "",
    description: "",
    technologies: [],
    projectUrl: "",
    githubUrl: "",
  };
}

export function createCertificationEntry(): CertificationEntry {
  return {
    id: createId(),
    enabled: true,
    name: "",
    issuer: "",
    issueDate: "",
    credentialUrl: "",
  };
}

export function createLanguageEntry(): LanguageEntry {
  return { id: createId(), enabled: true, language: "", proficiency: "" };
}

export function createCustomSection(): CustomSection {
  return { id: createId(), title: "", content: "" };
}

export function getCvDisplayName(cv: Pick<CvDocument, "name" | "personal">): string {
  return cv.name.trim() || cv.personal.fullName.trim() || "Untitled CV";
}

/** True when the CV has no content. Settings, template, and section order don't count. */
export function isCvEmpty(cv: CvDocument): boolean {
  return (
    !cv.name.trim() &&
    !cv.summary.trim() &&
    Object.values(cv.personal).every((value) => typeof value !== "string" || !value.trim()) &&
    cv.experience.length === 0 &&
    cv.education.length === 0 &&
    cv.skills.length === 0 &&
    cv.projects.length === 0 &&
    cv.certifications.length === 0 &&
    cv.languages.length === 0 &&
    cv.customSections.length === 0
  );
}
