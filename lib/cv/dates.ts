function toComparableMonth(value: string, edge: "start" | "end"): string {
  if (value.length !== 4) return value;
  return `${value}-${edge === "start" ? "01" : "12"}`;
}

/** Expects CvDate values ("", "YYYY", or "YYYY-MM"). */
export function isEndBeforeStart(start: string, end: string): boolean {
  if (!start || !end) return false;
  return toComparableMonth(end, "end") < toComparableMonth(start, "start");
}
