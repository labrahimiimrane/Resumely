import type { KeywordMatch } from "@/lib/ats/keywords";
import { isEndBeforeStart } from "@/lib/cv/dates";
import { buildCvView, toMailHref, toTelHref } from "@/lib/cv/render";
import type { EditorSectionId } from "@/lib/cv/sections";
import { CUSTOM_SECTION_PREFIX } from "@/lib/validations/cv";
import type { BuiltInSectionKey, CvDocument, ExperienceEntry } from "@/types/cv";

export type AtsStatus = "pass" | "warn" | "fail";
export type AtsCategory = "contact" | "sections" | "formatting" | "completeness" | "keywords";
export type AtsImpact = "High" | "Medium";
export type AtsVerdict = "Strong" | "Good" | "Needs work" | "Weak";

export type AtsCheck = {
  id: string;
  category: AtsCategory;
  status: AtsStatus;
  weight: number;
  title: string;
  detail: string;
  section: EditorSectionId;
  advice: string;
  /** Partial credit from 0 to 1; overrides the pass/warn/fail credit when present. */
  credit?: number;
};

export type AtsRecommendation = AtsCheck & { impact: AtsImpact };

export type AtsReport = {
  isEmpty: boolean;
  score: number;
  verdict: AtsVerdict;
  categories: { category: AtsCategory; label: string; score: number }[];
  checks: AtsCheck[];
  recommendations: AtsRecommendation[];
};

export const ATS_CATEGORY_LABELS: Record<AtsCategory, string> = {
  contact: "Contact details",
  sections: "Sections",
  formatting: "Formatting",
  completeness: "Completeness",
  keywords: "Keywords",
};

const CATEGORY_ORDER: readonly AtsCategory[] = ["contact", "sections", "formatting", "completeness", "keywords"];

/** Templates that render the profile photo (see the Modern and Executive templates). */
const PHOTO_TEMPLATES: ReadonlySet<CvDocument["settings"]["template"]> = new Set(["modern", "executive"]);

const MAX_HEADING_LENGTH = 40;
const MAX_BULLET_LENGTH = 220;
const SUMMARY_WORDS = { min: 30, max: 70 } as const;
const MIN_SKILLS = 5;
const MAX_RECOMMENDATIONS = 5;
const KEYWORD_RATIO = { pass: 0.7, warn: 0.4 } as const;

type CheckInput = Omit<AtsCheck, "category" | "weight">;

const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

function entryLabel(entry: Pick<ExperienceEntry, "jobTitle" | "company">): string {
  const title = entry.jobTitle.trim();
  const company = entry.company.trim();
  if (title && company) return `${title} at ${company}`;
  return title || company || "An entry";
}

function educationLabel(degree: string, institution: string): string {
  const a = degree.trim();
  const b = institution.trim();
  if (a && b) return `${a} at ${b}`;
  return a || b || "An entry";
}

function scoreOf(checks: AtsCheck[]): number {
  const total = checks.reduce((sum, check) => sum + check.weight, 0);
  if (total === 0) return 0;
  const earned = checks.reduce(
    (sum, check) =>
      sum + check.weight * (check.credit ?? (check.status === "pass" ? 1 : check.status === "warn" ? 0.5 : 0)),
    0,
  );
  return Math.round((100 * earned) / total);
}

function verdictOf(score: number): AtsVerdict {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs work";
  return "Weak";
}

export function analyzeCv(cv: CvDocument, keywordResult: KeywordMatch | null = null): AtsReport {
  const view = buildCvView(cv);
  const checks: AtsCheck[] = [];
  const add = (category: AtsCategory, weight: number, check: CheckInput) =>
    checks.push({ ...check, category, weight });

  const shown = (key: BuiltInSectionKey) => cv.sections.find((section) => section.key === key)?.enabled ?? true;
  const inView = (type: string) => view.sections.some((section) => section.type === type);

  const experience = shown("experience") ? cv.experience.filter((entry) => entry.enabled) : [];
  const education = shown("education") ? cv.education.filter((entry) => entry.enabled) : [];
  const certifications = shown("certifications") ? cv.certifications.filter((entry) => entry.enabled) : [];
  const skillGroups = shown("skills") ? cv.skills.filter((group) => group.enabled) : [];
  const bullets = experience.flatMap((entry) =>
    [...entry.responsibilities, ...entry.achievements].map((bullet) => bullet.trim()).filter(Boolean),
  );

  // Contact
  const { personal } = cv;
  const fullName = personal.fullName.trim();
  add("contact", 3, {
    id: "contact-name",
    status: fullName ? "pass" : "fail",
    title: fullName ? "Full name present" : "Full name is missing",
    detail: fullName
      ? "Your name is the first thing parsers and recruiters look for."
      : "Parsers use your name to create your candidate profile.",
    section: "personal",
    advice: "Add your full name at the top of your CV.",
  });

  const email = personal.email.trim();
  const emailValid = toMailHref(email) !== null;
  add("contact", 3, {
    id: "contact-email",
    status: emailValid ? "pass" : "fail",
    title: emailValid ? "Email address present" : email ? "Email address looks invalid" : "Email address is missing",
    detail: emailValid
      ? "Recruiters can reach you, and the link stays clickable in the PDF."
      : email
        ? "It doesn't look like an email address, so recruiters may not be able to reach you."
        : "Without an email, recruiters have no reliable way to contact you.",
    section: "personal",
    advice: email ? "Check the spelling of your email address." : "Add an email address you check often.",
  });

  const phone = personal.phone.trim();
  const phoneValid = toTelHref(phone) !== null;
  add("contact", 2, {
    id: "contact-phone",
    status: phoneValid ? "pass" : "warn",
    title: phoneValid ? "Phone number present" : phone ? "Check the phone number" : "Phone number is missing",
    detail: phoneValid
      ? "Recruiters often call to arrange interviews."
      : phone
        ? "It has too few digits to be a dialable number."
        : "Many recruiters prefer to call when arranging interviews.",
    section: "personal",
    advice: phone ? "Check the number, including the country code." : "Add a phone number with the country code.",
  });

  const location = personal.location.trim();
  add("contact", 1, {
    id: "contact-location",
    status: location ? "pass" : "warn",
    title: location ? "Location present" : "Location is missing",
    detail: location
      ? "Recruiters and filters can match you to roles near you."
      : "Some systems filter candidates by location.",
    section: "personal",
    advice: "Add a city and country, for example \"Berlin, Germany\".",
  });

  const linkedin = personal.linkedinUrl.trim();
  add("contact", 1, {
    id: "contact-linkedin",
    status: linkedin ? "pass" : "warn",
    title: linkedin ? "LinkedIn profile linked" : "No LinkedIn profile",
    detail: linkedin
      ? "Recruiters can check your full background."
      : "Recruiters often look for a LinkedIn profile to confirm your background.",
    section: "personal",
    advice: "Add your LinkedIn profile URL.",
  });

  // Sections
  const coreSections: {
    id: string;
    type: string;
    section: EditorSectionId;
    label: string;
    weight: number;
    missing: AtsStatus;
    why: string;
  }[] = [
    {
      id: "section-experience",
      type: "experience",
      section: "experience",
      label: "Work experience",
      weight: 3,
      missing: "fail",
      why: "Most systems rank candidates on their work history.",
    },
    {
      id: "section-education",
      type: "education",
      section: "education",
      label: "Education",
      weight: 2,
      missing: "warn",
      why: "Many roles filter on degrees or qualifications.",
    },
    {
      id: "section-skills",
      type: "skills",
      section: "skills",
      label: "Skills",
      weight: 2,
      missing: "warn",
      why: "A skills section is where systems look first for matching terms.",
    },
    {
      id: "section-summary",
      type: "summary",
      section: "summary",
      label: "Professional summary",
      weight: 2,
      missing: "warn",
      why: "A short summary tells recruiters who you are at a glance.",
    },
  ];
  for (const core of coreSections) {
    const present = inView(core.type);
    add("sections", core.weight, {
      id: core.id,
      status: present ? "pass" : core.missing,
      title: present ? `${core.label} section present` : `${core.label} section is missing`,
      detail: present ? "It uses a standard heading that parsers recognize." : core.why,
      section: core.section,
      advice: `Add a ${core.label.toLowerCase()} section, or show it if it's hidden.`,
    });
  }

  const customTitles = view.sections
    .filter((section) => section.type === "custom")
    .map((section) => {
      const id = section.key.slice(CUSTOM_SECTION_PREFIX.length);
      return cv.customSections.find((item) => item.id === id)?.title.trim() ?? "";
    });
  const badHeadings = customTitles.filter((title) => !title || title.length > MAX_HEADING_LENGTH).length;
  add("sections", 1, {
    id: "section-headings",
    status: badHeadings ? "warn" : "pass",
    title: badHeadings ? `${plural(badHeadings, "custom heading")} to review` : "Standard section headings",
    detail: badHeadings
      ? `Custom sections need a short, clear heading of ${MAX_HEADING_LENGTH} characters or fewer.`
      : "Built-in sections use standard headings that parsers recognize.",
    section: "custom",
    advice: "Give each custom section a short, plain heading such as \"Volunteering\" or \"Awards\".",
  });

  // Formatting
  const dated = [
    ...experience
      .filter((entry) => !entry.current && entry.startDate && entry.endDate)
      .map((entry) => ({ section: "experience" as const, label: entryLabel(entry), start: entry.startDate, end: entry.endDate })),
    ...education
      .filter((entry) => entry.startDate && entry.endDate)
      .map((entry) => ({
        section: "education" as const,
        label: educationLabel(entry.degree, entry.institution),
        start: entry.startDate,
        end: entry.endDate,
      })),
  ];
  if (dated.length > 0) {
    const wrong = dated.find((entry) => isEndBeforeStart(entry.start, entry.end));
    add("formatting", 3, {
      id: "format-date-order",
      status: wrong ? "fail" : "pass",
      title: wrong ? "Date error" : "Dates are in order",
      detail: wrong ? `${wrong.label} ends before it starts.` : "Every end date comes after its start date.",
      section: wrong?.section ?? "experience",
      advice: wrong
        ? `Correct the dates for ${wrong.label}. Parsers may drop or misorder entries with impossible dates.`
        : "",
    });
  }

  if (experience.length > 0) {
    const missing = experience.filter((entry) => !entry.startDate || (!entry.current && !entry.endDate)).length;
    add("formatting", 2, {
      id: "format-date-missing",
      status: missing ? "warn" : "pass",
      title: missing ? `${plural(missing, "experience entry", "experience entries")} missing dates` : "Experience dates present",
      detail: missing
        ? "Systems use dates to build your timeline and total experience."
        : "Every role has a start date and an end date or \"Present\".",
      section: "experience",
      advice: "Add a start date to every role, and an end date or mark it as current.",
    });
  }

  const dates = [
    ...experience.flatMap((entry) => [entry.startDate, entry.current ? "" : entry.endDate]),
    ...education.flatMap((entry) => [entry.startDate, entry.endDate]),
    ...certifications.map((entry) => entry.issueDate),
  ].filter(Boolean);
  if (dates.length >= 2) {
    const yearOnly = dates.filter((date) => date.length === 4).length;
    const mixed = yearOnly > 0 && yearOnly < dates.length;
    add("formatting", 1, {
      id: "format-date-style",
      status: mixed ? "warn" : "pass",
      title: mixed ? "Mixed date formats" : "Consistent date format",
      detail: mixed
        ? "Some dates show only a year while others include the month."
        : yearOnly
          ? "All dates use \"YYYY\"."
          : "All dates use \"Mon YYYY\".",
      section: "experience",
      advice: "Use the same date format everywhere, ideally month and year.",
    });
  }

  const photoShown = view.photo !== null && PHOTO_TEMPLATES.has(cv.settings.template);
  add("formatting", 2, {
    id: "format-photo",
    status: photoShown ? "warn" : "pass",
    title: photoShown ? "Profile photo included" : "No profile photo",
    detail: photoShown
      ? "Some systems misread images, and many regions discourage photos."
      : "Text-only CVs are the safest for parsers.",
    section: "personal",
    advice: "Hide the profile photo for online applications unless the role or region expects one.",
  });

  if (bullets.length > 0) {
    const long = bullets.filter((bullet) => bullet.length > MAX_BULLET_LENGTH).length;
    add("formatting", 1, {
      id: "format-bullet-length",
      status: long ? "warn" : "pass",
      title: long
        ? `${plural(long, "bullet")} longer than ${MAX_BULLET_LENGTH} characters`
        : "Bullets are a readable length",
      detail: long ? "Shorter bullets scan better for people and parsers." : "Short bullets scan well.",
      section: "experience",
      advice: `Split or trim bullets longer than ${MAX_BULLET_LENGTH} characters.`,
    });
  }

  // Completeness
  const summary = shown("summary") ? cv.summary.trim() : "";
  if (summary) {
    const words = summary.split(/\s+/).length;
    const healthy = words >= SUMMARY_WORDS.min && words <= SUMMARY_WORDS.max;
    add("completeness", 2, {
      id: "content-summary-length",
      status: healthy ? "pass" : "warn",
      title: healthy ? "Summary length is healthy" : words < SUMMARY_WORDS.min ? "Summary is short" : "Summary is long",
      detail: `${plural(words, "word")}. Aim for ${SUMMARY_WORDS.min} to ${SUMMARY_WORDS.max}.`,
      section: "summary",
      advice:
        words < SUMMARY_WORDS.min
          ? "Expand your summary with your focus, experience, and strongest results."
          : "Trim your summary to the few points that matter most for the role.",
    });
  }

  if (bullets.length > 0) {
    const quantified = bullets.filter((bullet) => /[0-9]/.test(bullet)).length;
    const enough = quantified * 2 >= bullets.length;
    add("completeness", 2, {
      id: "content-quantified",
      status: enough ? "pass" : "warn",
      title: enough
        ? `${quantified} of ${bullets.length} bullets include a number`
        : `Only ${quantified} of ${bullets.length} bullets include a number`,
      detail: "Quantified results make achievements concrete.",
      section: "experience",
      advice: "Add numbers to more bullets, such as team size, time saved, or growth.",
    });
  }

  if (experience.length > 0) {
    const thin = experience.filter(
      (entry) =>
        !entry.jobTitle.trim() ||
        !entry.company.trim() ||
        ![...entry.responsibilities, ...entry.achievements].some((bullet) => bullet.trim()),
    ).length;
    add("completeness", 2, {
      id: "content-experience-detail",
      status: thin ? "warn" : "pass",
      title: thin
        ? `${plural(thin, "experience entry", "experience entries")} incomplete`
        : "Experience entries are complete",
      detail: thin
        ? "Each role needs a job title, a company, and at least one bullet."
        : "Every role has a job title, company, and bullets.",
      section: "experience",
      advice: "Give every role a job title, a company, and at least one bullet.",
    });
  }

  if (education.length > 0) {
    const thin = education.filter((entry) => !entry.institution.trim() || !entry.degree.trim()).length;
    add("completeness", 1, {
      id: "content-education-detail",
      status: thin ? "warn" : "pass",
      title: thin
        ? `${plural(thin, "education entry", "education entries")} incomplete`
        : "Education entries are complete",
      detail: thin ? "Each entry needs an institution and a degree." : "Every entry has an institution and a degree.",
      section: "education",
      advice: "Add the institution and degree to every education entry.",
    });
  }

  const skillCount = skillGroups.reduce((sum, group) => sum + group.skills.filter((skill) => skill.trim()).length, 0);
  if (skillCount > 0) {
    const enough = skillCount >= MIN_SKILLS;
    add("completeness", 1, {
      id: "content-skills-count",
      status: enough ? "pass" : "warn",
      title: enough ? `${skillCount} skills listed` : `Only ${plural(skillCount, "skill")} listed`,
      detail: `Aim for at least ${MIN_SKILLS} relevant skills.`,
      section: "skills",
      advice: `List at least ${MIN_SKILLS} skills that match the roles you want.`,
    });
  }

  // Keywords
  if (keywordResult && keywordResult.total > 0) {
    const { found, missing, total } = keywordResult;
    const ratio = found.length / total;
    const examples = missing.slice(0, 3).map((keyword) => keyword.display);
    const list =
      examples.length === 3
        ? `${examples[0]}, ${examples[1]}, and ${examples[2]}`
        : examples.join(" and ");
    add("keywords", 4, {
      id: "keywords-match",
      status: ratio >= KEYWORD_RATIO.pass ? "pass" : ratio >= KEYWORD_RATIO.warn ? "warn" : "fail",
      credit: ratio,
      title: `${found.length} of ${total} job keywords found`,
      detail: "Systems often rank CVs by how well they match the job description's terms.",
      section: "skills",
      advice: list
        ? `Add missing keywords such as ${list} where they truthfully describe your experience.`
        : "",
    });
  }

  const categories = CATEGORY_ORDER.map((category) => ({
    category,
    label: ATS_CATEGORY_LABELS[category],
    checks: checks.filter((check) => check.category === category),
  }))
    .filter((group) => group.checks.length > 0)
    .map(({ category, label, checks: group }) => ({ category, label, score: scoreOf(group) }));

  const recommendations = checks
    .map((check, index) => ({ check, index }))
    .filter(({ check }) => check.status !== "pass")
    .sort(
      (a, b) =>
        (a.check.status === "fail" ? 0 : 1) - (b.check.status === "fail" ? 0 : 1) ||
        b.check.weight - a.check.weight ||
        a.index - b.index,
    )
    .slice(0, MAX_RECOMMENDATIONS)
    .map(({ check }): AtsRecommendation => ({ ...check, impact: check.status === "fail" ? "High" : "Medium" }));

  const score = scoreOf(checks);
  return { isEmpty: view.isEmpty, score, verdict: verdictOf(score), categories, checks, recommendations };
}
