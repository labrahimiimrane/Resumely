// A built-in, fictional example CV. Built from the normal factories so every entry gets a fresh id.

import {
  createCertificationEntry,
  createEducationEntry,
  createEmptyCv,
  createExperienceEntry,
  createLanguageEntry,
  createProjectEntry,
  createSkillGroup,
} from "@/lib/cv/document";
import type { CvDocument } from "@/types/cv";

export function createExampleCv(): CvDocument {
  const cv = createEmptyCv();
  return {
    ...cv,
    name: "Example CV - Alex Morgan",
    personal: {
      ...cv.personal,
      fullName: "Alex Morgan",
      title: "Senior Frontend Engineer",
      email: "alex.morgan@example.com",
      phone: "+1 555 0100",
      location: "Springfield, USA",
      linkedinUrl: "https://example.com/linkedin/alex-morgan",
      portfolioUrl: "https://example.com",
      githubUrl: "https://example.com/github/alex-morgan",
    },
    summary:
      "Frontend engineer with 8 years of experience building accessible, high-performance web applications with React and TypeScript. Led the migration of a customer dashboard to a component-driven architecture, cutting page load time by 40%. Enjoys mentoring engineers and turning complex requirements into simple, reliable interfaces.",
    experience: [
      {
        ...createExperienceEntry(),
        company: "Northwind Analytics",
        jobTitle: "Senior Frontend Engineer",
        location: "Remote",
        startDate: "2021-03",
        current: true,
        responsibilities: [
          "Own the architecture of the customer analytics dashboard used by 20,000 monthly users",
          "Mentor four frontend engineers through code review and pairing",
        ],
        achievements: [
          "Reduced dashboard load time by 40% by introducing code splitting and server-side data caching",
          "Raised accessibility audit score from 68 to 97 by rebuilding forms and navigation to WCAG 2.1 AA",
        ],
      },
      {
        ...createExperienceEntry(),
        company: "Contoso Retail",
        jobTitle: "Frontend Engineer",
        location: "Springfield, USA",
        startDate: "2017-06",
        endDate: "2021-02",
        responsibilities: [
          "Built and maintained checkout and account pages for the online store",
          "Worked with designers to create a shared component library",
        ],
        achievements: [
          "Increased checkout conversion by 12% by simplifying the payment flow",
          "Cut UI bug reports by 30% by adding visual regression tests to the release pipeline",
        ],
      },
    ],
    education: [
      {
        ...createEducationEntry(),
        institution: "Springfield State University",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science",
        startDate: "2013",
        endDate: "2017",
        description: "Graduated with honors. Capstone project: a real-time collaborative whiteboard.",
      },
    ],
    skills: [
      {
        ...createSkillGroup(),
        name: "Languages",
        skills: ["TypeScript", "JavaScript", "HTML", "CSS"],
      },
      {
        ...createSkillGroup(),
        name: "Frameworks and tools",
        skills: ["React", "Next.js", "Tailwind CSS", "Vite", "Playwright"],
      },
      {
        ...createSkillGroup(),
        name: "Practices",
        skills: ["Accessibility (WCAG)", "Performance optimization", "Design systems", "Code review"],
      },
    ],
    projects: [
      {
        ...createProjectEntry(),
        name: "Open Budget Planner",
        description:
          "A privacy-first personal budgeting app that keeps all data in the browser. Includes charts, CSV import, and offline support.",
        technologies: ["React", "TypeScript", "IndexedDB"],
        projectUrl: "https://example.com/budget-planner",
        githubUrl: "https://example.com/github/alex-morgan/budget-planner",
      },
    ],
    certifications: [
      {
        ...createCertificationEntry(),
        name: "Professional Web Accessibility Certificate",
        issuer: "Example Accessibility Institute",
        issueDate: "2022-09",
        credentialUrl: "https://example.com/credentials/12345",
      },
    ],
    languages: [
      { ...createLanguageEntry(), language: "English", proficiency: "Native" },
      { ...createLanguageEntry(), language: "Spanish", proficiency: "Professional working proficiency" },
    ],
  };
}
