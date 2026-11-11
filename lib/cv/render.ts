import { z } from "zod";
import { formatCvDate, formatCvDateRange } from "@/lib/cv/dates";
import { CUSTOM_SECTION_PREFIX } from "@/lib/validations/cv";
import type { CvDocument, SectionKey } from "@/types/cv";

export type ContactKind = "email" | "phone" | "location" | "linkedin" | "portfolio" | "github";
export type ContactItem = { kind: ContactKind; text: string; href: string | null };
export type ViewLink = { text: string; href: string };

type SectionBase = { key: SectionKey; heading: string };

export type ViewSection = SectionBase &
  (
    | { type: "summary"; text: string }
    | {
        type: "experience";
        items: { id: string; title: string; organization: string; location: string; dates: string; bullets: string[] }[];
      }
    | {
        type: "education";
        items: { id: string; title: string; organization: string; detail: string; dates: string; description: string }[];
      }
    | { type: "skills"; groups: { id: string; name: string; skills: string[] }[] }
    | {
        type: "projects";
        items: { id: string; name: string; description: string; technologies: string[]; links: ViewLink[] }[];
      }
    | { type: "certifications"; items: { id: string; name: string; issuer: string; date: string; link: ViewLink | null }[] }
    | { type: "languages"; items: { id: string; language: string; proficiency: string }[] }
    | { type: "custom"; title: string; text: string }
  );

export type CvView = {
  isEmpty: boolean;
  header: { name: string; title: string; contacts: ContactItem[] };
  photo: string | null;
  sections: ViewSection[];
};

export const SECTION_HEADINGS = {
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  custom: "Additional Information",
} as const;

const SAFE_HREF = /^(https?:|mailto:|tel:)/i;

function safe(href: string): string | null {
  return SAFE_HREF.test(href) ? href : null;
}

export function toLinkHref(url: string): string | null {
  const value = url.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return safe(value);
  return safe(`https://${value.replace(/^\/+/, "")}`);
}

export function toDisplayUrl(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

export function toMailHref(email: string): string | null {
  const value = email.trim();
  if (!value || !z.email().safeParse(value).success) return null;
  return safe(`mailto:${value}`);
}

export function toTelHref(phone: string): string | null {
  const value = phone.trim();
  const digits = value.replace(/\D/g, "");
  if (digits.length < 5) return null;
  return safe(`tel:${value.startsWith("+") ? "+" : ""}${digits}`);
}

const clean = (value: string) => value.trim();
const cleanList = (values: string[]) => values.map(clean).filter(Boolean);
const hasText = (...values: (string | string[])[]) =>
  values.some((value) => (Array.isArray(value) ? value.length > 0 : value.length > 0));

function link(url: string): ViewLink | null {
  const href = toLinkHref(url);
  return href ? { text: toDisplayUrl(url), href } : null;
}

function buildContacts(cv: CvDocument): ContactItem[] {
  const { email, phone, location, linkedinUrl, portfolioUrl, githubUrl } = cv.personal;
  const contacts: ContactItem[] = [];
  if (clean(email)) contacts.push({ kind: "email", text: clean(email), href: toMailHref(email) });
  if (clean(phone)) contacts.push({ kind: "phone", text: clean(phone), href: toTelHref(phone) });
  if (clean(location)) contacts.push({ kind: "location", text: clean(location), href: null });
  const urls: [ContactKind, string][] = [
    ["linkedin", linkedinUrl],
    ["portfolio", portfolioUrl],
    ["github", githubUrl],
  ];
  for (const [kind, url] of urls) {
    const item = link(url);
    if (item) contacts.push({ kind, text: item.text, href: item.href });
  }
  return contacts;
}

function buildSection(cv: CvDocument, key: SectionKey): ViewSection | null {
  if (key.startsWith(CUSTOM_SECTION_PREFIX)) {
    const section = cv.customSections.find((item) => `${CUSTOM_SECTION_PREFIX}${item.id}` === key);
    if (!section) return null;
    const title = clean(section.title);
    const text = clean(section.content);
    if (!text) return null;
    return { key, type: "custom", heading: title || SECTION_HEADINGS.custom, title: title || SECTION_HEADINGS.custom, text };
  }

  switch (key) {
    case "summary": {
      const text = clean(cv.summary);
      return text ? { key, type: "summary", heading: SECTION_HEADINGS.summary, text } : null;
    }
    case "experience": {
      const items = cv.experience
        .filter((entry) => entry.enabled)
        .map((entry) => ({
          id: entry.id,
          title: clean(entry.jobTitle),
          organization: clean(entry.company),
          location: clean(entry.location),
          dates: formatCvDateRange(entry.startDate, entry.endDate, entry.current),
          bullets: cleanList([...entry.responsibilities, ...entry.achievements]),
        }))
        .filter((item) => hasText(item.title, item.organization, item.location, item.bullets));
      return items.length ? { key, type: "experience", heading: SECTION_HEADINGS.experience, items } : null;
    }
    case "education": {
      const items = cv.education
        .filter((entry) => entry.enabled)
        .map((entry) => ({
          id: entry.id,
          title: clean(entry.degree),
          organization: clean(entry.institution),
          detail: clean(entry.fieldOfStudy),
          dates: formatCvDateRange(entry.startDate, entry.endDate, false),
          description: clean(entry.description),
        }))
        .filter((item) => hasText(item.title, item.organization, item.detail, item.description));
      return items.length ? { key, type: "education", heading: SECTION_HEADINGS.education, items } : null;
    }
    case "skills": {
      const groups = cv.skills
        .filter((group) => group.enabled)
        .map((group) => ({ id: group.id, name: clean(group.name), skills: cleanList(group.skills) }))
        .filter((group) => group.skills.length > 0);
      return groups.length ? { key, type: "skills", heading: SECTION_HEADINGS.skills, groups } : null;
    }
    case "projects": {
      const items = cv.projects
        .filter((entry) => entry.enabled)
        .map((entry) => ({
          id: entry.id,
          name: clean(entry.name),
          description: clean(entry.description),
          technologies: cleanList(entry.technologies),
          links: [link(entry.projectUrl), link(entry.githubUrl)].filter((item): item is ViewLink => item !== null),
        }))
        .filter((item) => hasText(item.name, item.description, item.technologies));
      return items.length ? { key, type: "projects", heading: SECTION_HEADINGS.projects, items } : null;
    }
    case "certifications": {
      const items = cv.certifications
        .filter((entry) => entry.enabled)
        .map((entry) => ({
          id: entry.id,
          name: clean(entry.name),
          issuer: clean(entry.issuer),
          date: formatCvDate(entry.issueDate),
          link: link(entry.credentialUrl),
        }))
        .filter((item) => hasText(item.name, item.issuer));
      return items.length ? { key, type: "certifications", heading: SECTION_HEADINGS.certifications, items } : null;
    }
    case "languages": {
      const items = cv.languages
        .filter((entry) => entry.enabled)
        .map((entry) => ({ id: entry.id, language: clean(entry.language), proficiency: clean(entry.proficiency) }))
        .filter((item) => hasText(item.language));
      return items.length ? { key, type: "languages", heading: SECTION_HEADINGS.languages, items } : null;
    }
    default:
      return null;
  }
}

export function buildCvView(cv: CvDocument): CvView {
  const header = {
    name: clean(cv.personal.fullName),
    title: clean(cv.personal.title),
    contacts: buildContacts(cv),
  };
  const sections = cv.sections
    .filter((section) => section.enabled)
    .map((section) => buildSection(cv, section.key))
    .filter((section): section is ViewSection => section !== null);
  return {
    isEmpty: !header.name && !header.title && header.contacts.length === 0 && sections.length === 0,
    header,
    photo: cv.personal.showPhoto && cv.personal.photo ? cv.personal.photo : null,
    sections,
  };
}
