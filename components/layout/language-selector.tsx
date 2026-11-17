"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { useCv } from "@/hooks/use-cv";
import { cn } from "@/lib/utils";
import { CV_LANGUAGES } from "@/lib/validations/cv";
import type { CvLanguage } from "@/types/cv";

// Each language is named in itself, so a French speaker finds "Français" in the English UI.
export const LANGUAGE_LABELS: Record<CvLanguage, string> = {
  en: "English",
  fr: "Français",
};

type LanguageSelectorProps = {
  /** Keep the "CV language" label visible (Preview tab row). */
  showLabel?: boolean;
  className?: string;
};

/** The CV's language, for the header (phones, and md and up) and the small-tablet Preview tab row; Customize has its own field for the same setting. */
export function LanguageSelector({ showLabel = false, className }: LanguageSelectorProps) {
  const { cv, updateCv } = useCv();
  const selectId = useId();
  const current = cv.settings.language;

  const select = (next: CvLanguage) => {
    if (next === current) return;
    updateCv((doc) => ({ ...doc, settings: { ...doc.settings, language: next } }));
  };

  return (
    <div
      className={cn(
        "relative flex h-[34px] shrink-0 items-center gap-2 rounded-md border bg-card pl-3 text-[13px] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        className,
      )}
    >
      <label
        htmlFor={selectId}
        className={showLabel ? "text-xs text-muted-foreground" : "text-xs text-muted-foreground max-xl:sr-only"}
      >
        CV language
      </label>
      <select
        id={selectId}
        value={current}
        onChange={(event) => select(event.target.value as CvLanguage)}
        className="h-full cursor-pointer appearance-none bg-transparent pr-8 font-medium outline-none dark:[color-scheme:dark]"
      >
        {CV_LANGUAGES.map((language) => (
          <option key={language} value={language}>
            {LANGUAGE_LABELS[language]}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 size-4 text-muted-foreground"
      />
    </div>
  );
}
