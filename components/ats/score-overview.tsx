import type { AtsReport } from "@/lib/ats/analyze";

export const ATS_DISCLAIMER =
  "Advisory only. Applicant tracking systems differ, and no score guarantees how a specific system will read your CV.";

function band(score: number): { stroke: string; fill: string } {
  if (score >= 85) return { stroke: "stroke-success", fill: "fill-success" };
  if (score >= 50) return { stroke: "stroke-warning", fill: "fill-warning" };
  return { stroke: "stroke-destructive", fill: "fill-destructive" };
}

function verdictLine(report: AtsReport): string {
  const issues = report.checks.filter((check) => check.status === "fail").length;
  const warnings = report.checks.filter((check) => check.status === "warn").length;
  if (issues === 0 && warnings === 0) return "No issues found. Keep tailoring it to each role.";
  const parts = [
    issues ? `${issues} ${issues === 1 ? "issue" : "issues"}` : "",
    warnings ? `${warnings} ${warnings === 1 ? "warning" : "warnings"}` : "",
  ].filter(Boolean);
  return `${parts.join(" and ")} to review.`;
}

export function ScoreOverview({ report }: { report: AtsReport }) {
  return (
    <section
      aria-label="Score overview"
      className="grid gap-6 rounded-xl border bg-card p-6 shadow-xs sm:grid-cols-[minmax(0,240px)_1fr] sm:items-center"
    >
      <div className="flex items-center gap-5">
        <div role="img" aria-label={`Score ${report.score} out of 100`} className="relative size-[116px] shrink-0">
          <svg viewBox="0 0 116 116" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="58" cy="58" r="47" fill="none" strokeWidth="11" className="stroke-muted" />
            <circle
              cx="58"
              cy="58"
              r="47"
              fill="none"
              strokeWidth="11"
              pathLength={100}
              strokeDasharray={`${report.score} 100`}
              className={band(report.score).stroke}
            />
          </svg>
          <span aria-hidden="true" className="absolute inset-0 grid place-content-center text-center">
            <b className="font-mono text-[26px] leading-none font-medium">{report.score}</b>
            <small className="text-xs text-faint">of 100</small>
          </span>
        </div>
        <div>
          <p className="text-lg font-semibold">{report.verdict}</p>
          <p className="text-[13px] text-muted-foreground">{verdictLine(report)}</p>
        </div>
      </div>
      <ul className="grid gap-3">
        {report.categories.map((item) => (
          <li
            key={item.category}
            className="grid grid-cols-[110px_1fr_36px] items-center gap-3 text-[13px]"
          >
            <span>{item.label}</span>
            <svg aria-hidden="true" className="h-1.5 w-full overflow-hidden rounded-full">
              <rect width="100%" height="100%" rx="3" className="fill-muted" />
              <rect width={`${item.score}%`} height="100%" rx="3" className={band(item.score).fill} />
            </svg>
            <span className="text-right font-mono text-xs text-muted-foreground">
              <span className="sr-only">{item.label} score </span>
              {item.score}
            </span>
          </li>
        ))}
      </ul>
      <p className="rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground sm:col-span-2">
        {ATS_DISCLAIMER}
      </p>
    </section>
  );
}
