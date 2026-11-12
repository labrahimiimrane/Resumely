// Built-in writing tips for each editor section. Static plain text: no AI API, no network.

import type { EditorSectionId } from "@/lib/cv/sections";

export const SECTION_TIPS: Record<EditorSectionId, readonly string[]> = {
  personal: [
    "Use your full name as it appears on professional profiles.",
    "Add a job title that matches the roles you are applying for.",
    "Use a professional email address and a phone number you answer.",
    "City and country are enough for location; a full street address is not needed.",
  ],
  summary: [
    "Keep it to two to four sentences.",
    "Lead with your role and years of experience.",
    "Mention two or three strengths that match the job you want.",
    "Write without \"I\" and avoid vague claims like \"hard-working\" without evidence.",
  ],
  experience: [
    "List roles with the most recent first.",
    "Start each bullet with an action verb and a result.",
    "Use numbers where you can: percentages, amounts, time saved, team size.",
    "Aim for three to six bullets per role, with more detail for recent roles.",
    "Use the job title your employer used, so it is easy to verify.",
  ],
  education: [
    "List degrees and programs with the most recent first.",
    "Include the institution, qualification, and dates.",
    "Add honors, a relevant thesis, or key coursework only if it supports your goal.",
    "Once you have several years of experience, keep this section short.",
  ],
  skills: [
    "Group skills under short, clear category names.",
    "Use the same wording as the job description where it is accurate.",
    "List skills you can discuss confidently in an interview.",
    "Prefer specific tools and methods over generic traits.",
  ],
  projects: [
    "Pick projects that show skills relevant to the roles you want.",
    "Say what you built, the tools you used, and the outcome.",
    "Add a link to a live demo or code where you can.",
    "Describe your own part clearly on team projects.",
  ],
  certifications: [
    "Use the official certification name.",
    "Include the issuing organization and the date earned.",
    "Leave out expired certifications unless they are still relevant.",
    "Add a credential link if the issuer provides one.",
  ],
  languages: [
    "Use consistent levels such as Native, Fluent, Professional, or Basic.",
    "Be honest about your level; it may be tested.",
    "List the languages that matter for the role first.",
  ],
  custom: [
    "Use a standard heading such as Volunteering, Awards, or Publications.",
    "Include only items that add something the rest of your CV does not.",
    "Write entries the same way as experience: what you did and the result.",
  ],
};
