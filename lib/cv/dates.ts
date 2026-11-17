import type { CvLanguage } from "@/types/cv";

function toComparableMonth(value: string, edge: "start" | "end"): string {
  if (value.length !== 4) return value;
  return `${value}-${edge === "start" ? "01" : "12"}`;
}

/** Expects CvDate values ("", "YYYY", or "YYYY-MM"). */
export function isEndBeforeStart(start: string, end: string): boolean {
  if (!start || !end) return false;
  return toComparableMonth(end, "end") < toComparableMonth(start, "start");
}

// Fixed tables rather than Intl, so the browser preview and the server PDF render identical text.
const MONTH_NAMES: Record<CvLanguage, readonly string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  fr: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
};

const PRESENT: Record<CvLanguage, string> = { en: "Present", fr: "Aujourd'hui" };

/** "2022-03" -> "Mar 2022" ("mars 2022" in French), "2019" -> "2019", "" -> "". */
export function formatCvDate(value: string, language: CvLanguage = "en"): string {
  const [year, month] = value.split("-");
  if (!year) return "";
  const monthName = month ? MONTH_NAMES[language][Number(month) - 1] : undefined;
  return monthName ? `${monthName} ${year}` : year;
}

export function formatCvDateRange(start: string, end: string, current: boolean, language: CvLanguage = "en"): string {
  const from = formatCvDate(start, language);
  const to = current ? PRESENT[language] : formatCvDate(end, language);
  if (from && to) return `${from} - ${to}`;
  return from || to;
}
