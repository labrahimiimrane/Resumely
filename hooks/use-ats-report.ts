"use client";

import { useDeferredValue, useMemo } from "react";
import { useCv } from "@/hooks/use-cv";
import { analyzeCv } from "@/lib/ats/analyze";
import { extractKeywords, matchKeywords } from "@/lib/ats/keywords";

/**
 * The ATS report for the current CV, with keyword scoring when a job description is given.
 * Shared by the ATS panel and the sidebar badge so both always show the same score.
 * The description is deferred so typing stays responsive.
 */
export function useAtsReport(jobDescription: string) {
  const { cv } = useCv();
  const deferredDescription = useDeferredValue(jobDescription);
  const keywords = useMemo(() => extractKeywords(deferredDescription), [deferredDescription]);
  const keywordMatch = useMemo(() => matchKeywords(keywords, cv), [keywords, cv]);
  const hasDescription = deferredDescription.trim() !== "";
  const report = useMemo(() => analyzeCv(cv, hasDescription ? keywordMatch : null), [cv, hasDescription, keywordMatch]);
  return { report, keywordMatch, hasDescription };
}
