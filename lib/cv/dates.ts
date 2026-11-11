function toComparableMonth(value: string, edge: "start" | "end"): string {
  if (value.length !== 4) return value;
  return `${value}-${edge === "start" ? "01" : "12"}`;
}

/** Expects CvDate values ("", "YYYY", or "YYYY-MM"). */
export function isEndBeforeStart(start: string, end: string): boolean {
  if (!start || !end) return false;
  return toComparableMonth(end, "end") < toComparableMonth(start, "start");
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2022-03" -> "Mar 2022", "2019" -> "2019", "" -> "". */
export function formatCvDate(value: string): string {
  const [year, month] = value.split("-");
  if (!year) return "";
  const monthName = month ? MONTH_NAMES[Number(month) - 1] : undefined;
  return monthName ? `${monthName} ${year}` : year;
}

export function formatCvDateRange(start: string, end: string, current: boolean): string {
  const from = formatCvDate(start);
  const to = current ? "Present" : formatCvDate(end);
  if (from && to) return `${from} - ${to}`;
  return from || to;
}
