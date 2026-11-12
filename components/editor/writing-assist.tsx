"use client";

import { useId, type ReactNode } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type AssistGroup = {
  label: string;
  /** "chip" for short items (verbs, phrases); "block" for full sentences (examples). */
  layout: "chip" | "block";
  items: readonly string[];
  /** Accessible name for an item, for example `Insert action verb "Mentored"`. */
  itemLabel: (item: string, index: number) => string;
  /** Text actually inserted; defaults to the item itself. */
  insertText?: (item: string) => string;
};

type WritingAssistProps = {
  groups: AssistGroup[];
  onInsert: (text: string) => void;
  /** Whether a given inserted text fits the target field. */
  canInsert: (text: string) => boolean;
  /** Shown when at least one item can't be inserted. */
  disabledReason: string;
  /** Extra controls rendered above the groups, such as a category picker. */
  controls?: ReactNode;
};

const CHIP =
  "rounded-full border bg-card px-2.5 py-[3px] text-xs transition-colors outline-none hover:border-primary hover:text-primary-soft-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50";
const BLOCK =
  "w-full rounded-md border bg-card px-3 py-2 text-left text-xs leading-relaxed transition-colors outline-none hover:border-primary hover:text-primary-soft-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50";

export function WritingAssist({ groups, onInsert, canInsert, disabledReason, controls }: WritingAssistProps) {
  const baseId = useId();
  const anyBlocked = groups.some((group) =>
    group.items.some((item) => !canInsert(group.insertText ? group.insertText(item) : item)),
  );

  return (
    <details className="group rounded-[10px] border border-dashed bg-background">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-[10px] px-3 py-2 text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
        <Sparkles aria-hidden="true" className="size-3.5 text-primary" />
        Writing help
        <ChevronDown aria-hidden="true" className="ml-auto size-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-3 px-3 pb-3">
        {controls}
        {groups.map((group, groupIndex) => {
          const labelId = `${baseId}-group-${groupIndex}`;
          return (
            <div key={group.label} className="flex flex-col gap-2">
              <p id={labelId} className="text-xs text-muted-foreground">
                {group.label}
              </p>
              <div
                role="group"
                aria-labelledby={labelId}
                className={cn(group.layout === "chip" ? "flex flex-wrap gap-1.5" : "flex flex-col gap-1.5")}
              >
                {group.items.map((item, index) => {
                  const text = group.insertText ? group.insertText(item) : item;
                  return (
                    <button
                      key={item}
                      type="button"
                      aria-label={group.itemLabel(item, index)}
                      disabled={!canInsert(text)}
                      onClick={() => onInsert(text)}
                      className={group.layout === "chip" ? CHIP : BLOCK}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {anyBlocked ? disabledReason : ""}
        </p>
      </div>
    </details>
  );
}
