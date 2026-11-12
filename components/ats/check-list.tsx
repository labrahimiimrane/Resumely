import { Check, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AtsCheck, AtsReport, AtsStatus } from "@/lib/ats/analyze";
import { EDITOR_SECTIONS, type EditorSectionId } from "@/lib/cv/sections";
import { cn } from "@/lib/utils";

const STATUS_TEXT: Record<AtsStatus, string> = { pass: "Passed", warn: "Warning", fail: "Issue" };
const STATUS_ICON = { pass: Check, warn: TriangleAlert, fail: X } as const;

export function sectionLabel(id: EditorSectionId): string {
  return EDITOR_SECTIONS.find((section) => section.id === id)?.label ?? id;
}

export function StatusIcon({ status }: { status: AtsStatus }) {
  const Icon = STATUS_ICON[status];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-[22px] shrink-0 place-items-center rounded-full",
        status === "pass" && "bg-success-soft text-success",
        status === "warn" && "bg-warning-soft text-warning",
        status === "fail" && "bg-destructive-soft text-destructive",
      )}
    >
      <Icon className="size-3" strokeWidth={2.5} />
    </span>
  );
}

export function FixButton({ section, onFix }: { section: EditorSectionId; onFix: (id: EditorSectionId) => void }) {
  return (
    <Button
      variant="ghost"
      size="xs"
      onClick={() => onFix(section)}
      className="shrink-0 font-medium text-sidebar-accent-foreground"
    >
      Fix in {sectionLabel(section)}
    </Button>
  );
}

type CheckListProps = {
  report: AtsReport;
  onFix: (id: EditorSectionId) => void;
};

export function CheckList({ report, onFix }: CheckListProps) {
  const count = (status: AtsStatus) => report.checks.filter((check) => check.status === status).length;
  const passed = count("pass");
  const warnings = count("warn");
  const issues = count("fail");

  return (
    <section aria-labelledby="ats-checks-heading" className="rounded-xl border bg-card p-6 shadow-xs">
      <h2 id="ats-checks-heading" className="text-[15px] font-semibold">
        Checks
      </h2>
      <p className="mt-0.5 text-[13px] text-muted-foreground">
        {passed} passed, {warnings} {warnings === 1 ? "warning" : "warnings"}, {issues}{" "}
        {issues === 1 ? "issue" : "issues"}
      </p>
      {report.categories.map((category) => (
        <div key={category.category}>
          <h3 className="mt-5 mb-1 text-xs font-medium tracking-wider text-faint uppercase">{category.label}</h3>
          <ul>
            {report.checks
              .filter((check) => check.category === category.category)
              .map((check) => (
                <CheckRow key={check.id} check={check} onFix={onFix} />
              ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function CheckRow({ check, onFix }: { check: AtsCheck; onFix: (id: EditorSectionId) => void }) {
  return (
    <li className="flex items-start gap-3 border-t py-3 first:border-t-0">
      <StatusIcon status={check.status} />
      <div className="min-w-0 flex-1 break-words">
        <p className="text-[13px] font-medium">
          <span className="sr-only">{STATUS_TEXT[check.status]}: </span>
          {check.title}
        </p>
        <p className="text-xs text-muted-foreground">{check.detail}</p>
      </div>
      {check.status !== "pass" ? <FixButton section={check.section} onFix={onFix} /> : null}
    </li>
  );
}
