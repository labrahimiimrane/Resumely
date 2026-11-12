"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type Keyword, type KeywordMatch, MAX_JOB_DESCRIPTION_LENGTH } from "@/lib/ats/keywords";
import { cn } from "@/lib/utils";

// How long the keyword count must stay unchanged before screen readers hear it.
const KEYWORD_ANNOUNCE_DELAY_MS = 1000;

type KeywordCardProps = {
  value: string;
  onChange: (value: string) => void;
  /** Whether the analyzed (deferred) job description has any text. */
  hasDescription: boolean;
  match: KeywordMatch;
};

export function KeywordCard({ value, onChange, hasDescription, match }: KeywordCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const status = !hasDescription
    ? ""
    : match.total === 0
      ? "No keywords found. Paste the full job description."
      : `${match.found.length} of ${match.total} keywords found`;
  // Screen readers get the count once it settles, not on every change while typing or pasting.
  const [announced, setAnnounced] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnounced(status), KEYWORD_ANNOUNCE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  function clear() {
    onChange("");
    textareaRef.current?.focus();
  }

  return (
    <section aria-labelledby="ats-keywords-heading" className="relative rounded-xl border bg-card p-6 shadow-xs">
      <h2 id="ats-keywords-heading" className="text-[15px] font-semibold">
        Keywords
      </h2>
      <p id="ats-keywords-help" className="mt-0.5 text-[13px] text-muted-foreground">
        Paste a job description to compare. Nothing leaves your browser.
      </p>
      <Label htmlFor="ats-job-description" className="mt-4 mb-2 text-[13px]">
        Job description
      </Label>
      <Textarea
        id="ats-job-description"
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby="ats-keywords-help"
        maxLength={MAX_JOB_DESCRIPTION_LENGTH}
        rows={4}
        className="max-h-60"
      />
      <div className="mt-4 mb-2 flex min-h-7 items-center justify-between gap-3 text-xs text-muted-foreground">
        {/* Visual only: the settled status below is what screen readers read. */}
        <p aria-hidden="true">{status}</p>
        <p role="status" className="sr-only">
          {announced}
        </p>
        {value ? (
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
        ) : null}
      </div>
      {hasDescription && match.total > 0 ? (
        <ul aria-label="Job keywords" className="flex flex-wrap gap-1.5">
          {match.found.map((keyword) => (
            <KeywordChip key={keyword.term} keyword={keyword} found />
          ))}
          {match.missing.map((keyword) => (
            <KeywordChip key={keyword.term} keyword={keyword} found={false} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function KeywordChip({ keyword, found }: { keyword: Keyword; found: boolean }) {
  return (
    <li
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs break-words",
        found ? "border-transparent bg-success-soft text-success" : "bg-background text-muted-foreground",
      )}
    >
      {found ? <Check aria-hidden="true" className="size-3 shrink-0" strokeWidth={2.5} /> : null}
      <span className="sr-only">{found ? "Found: " : "Missing: "}</span>
      <span className="min-w-0 break-words">{keyword.display}</span>
    </li>
  );
}
