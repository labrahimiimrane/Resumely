"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { TEMPLATE_LABELS, type TemplateId } from "@/components/templates";
import { useCv } from "@/hooks/use-cv";
import { TEMPLATE_IDS } from "@/lib/validations/cv";

type TemplateSelectorProps = {
  /** Keep the "Template" label visible on narrow screens (Preview tab row). */
  showLabel?: boolean;
};

export function TemplateSelector({ showLabel = false }: TemplateSelectorProps) {
  const { cv, updateCv } = useCv();
  const selectId = useId();
  const current = cv.settings.template;

  const select = (next: TemplateId) => {
    if (next === current) return;
    updateCv((doc) => ({ ...doc, settings: { ...doc.settings, template: next } }));
  };

  return (
    <div className="relative flex h-[34px] shrink-0 items-center gap-2 rounded-md border bg-card pl-3 text-[13px] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      <label htmlFor={selectId} className={showLabel ? "text-xs text-muted-foreground" : "text-xs text-muted-foreground max-lg:sr-only"}>
        Template
      </label>
      <select
        id={selectId}
        value={current}
        onChange={(event) => select(event.target.value as TemplateId)}
        className="h-full cursor-pointer appearance-none bg-transparent pr-8 font-medium outline-none dark:[color-scheme:dark]"
      >
        {TEMPLATE_IDS.map((id) => (
          <option key={id} value={id}>
            {TEMPLATE_LABELS[id]}
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
