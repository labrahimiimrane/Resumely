"use client";

import { useEffect, useRef } from "react";
import { CheckList } from "@/components/ats/check-list";
import { KeywordCard } from "@/components/ats/keyword-card";
import { RecommendationList } from "@/components/ats/recommendation-list";
import { ATS_DISCLAIMER, ScoreOverview } from "@/components/ats/score-overview";
import { Button } from "@/components/ui/button";
import { useAtsReport } from "@/hooks/use-ats-report";
import type { EditorSectionId } from "@/lib/cv/sections";

type AtsPanelProps = {
  onNavigate: (id: EditorSectionId) => void;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
};

export function AtsPanel({ onNavigate, jobDescription, onJobDescriptionChange }: AtsPanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { report, keywordMatch, hasDescription } = useAtsReport(jobDescription);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section aria-labelledby="ats-heading" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
        <div className="min-w-0 flex-1">
          <h1
            id="ats-heading"
            ref={headingRef}
            tabIndex={-1}
            className="rounded-sm text-[22px] font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            ATS analysis
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            How readable your CV is for applicant tracking systems, and what to improve.
          </p>
        </div>
        {report.isEmpty ? null : <span className="text-xs text-faint">Updated as you edit</span>}
      </div>

      {report.isEmpty ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed bg-card p-6">
          <p className="text-[15px] font-medium">Add your details to see how ATS-ready your CV is</p>
          <p className="text-[13px] text-muted-foreground">{ATS_DISCLAIMER}</p>
          <Button variant="outline" onClick={() => onNavigate("personal")}>
            Open Personal information
          </Button>
        </div>
      ) : (
        <>
          <ScoreOverview report={report} />
          {/* The editor column is single-width, so the ranked advice comes before the full check list. */}
          <RecommendationList recommendations={report.recommendations} onFix={onNavigate} />
          <KeywordCard
            value={jobDescription}
            onChange={onJobDescriptionChange}
            hasDescription={hasDescription}
            match={keywordMatch}
          />
          <CheckList report={report} onFix={onNavigate} />
        </>
      )}
    </section>
  );
}
