"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextAreaField } from "@/components/editor/text-field";
import { WritingAssist, type AssistGroup } from "@/components/editor/writing-assist";
import { useCv } from "@/hooks/use-cv";
import { useSyncValidFields } from "@/hooks/use-sync-valid-fields";
import { LONG_TEXT_MAX } from "@/lib/validations/cv";
import { summaryFormSchema, type SummaryFormValues } from "@/lib/validations/forms";
import { PROFESSIONAL_PHRASES, SUMMARY_EXAMPLES } from "@/lib/writing/suggestions";

const SUMMARY_GROUPS: AssistGroup[] = [
  {
    label: "Summary examples",
    layout: "block",
    items: SUMMARY_EXAMPLES,
    itemLabel: (_, index) => `Insert summary example ${index + 1}`,
  },
  {
    label: "Professional phrases",
    layout: "chip",
    items: PROFESSIONAL_PHRASES,
    itemLabel: (item) => `Insert phrase "${item}"`,
  },
];

/** Fills an empty summary, otherwise appends after the trimmed text with one space. */
function withInserted(current: string, text: string): string {
  const trimmed = current.trimEnd();
  return trimmed.trim() ? `${trimmed} ${text}` : text;
}

export function SummarySection() {
  const { cv } = useCv();
  const form = useForm<SummaryFormValues>({
    resolver: zodResolver(summaryFormSchema),
    mode: "onChange",
    defaultValues: { summary: cv.summary },
  });
  const summary = useWatch({ control: form.control, name: "summary" });

  useSyncValidFields(
    form,
    summaryFormSchema,
    (current, fields: Partial<SummaryFormValues>) => ({ ...current, summary: fields.summary ?? current.summary }),
    "summary",
  );

  function insert(text: string) {
    const next = withInserted(form.getValues("summary"), text);
    if (next.length > LONG_TEXT_MAX) return;
    form.setValue("summary", next, { shouldValidate: true, shouldDirty: true });
    const textarea = document.getElementById("summary");
    if (textarea instanceof HTMLTextAreaElement) {
      textarea.focus();
      textarea.setSelectionRange(next.length, next.length);
    }
  }

  return (
    <form
      noValidate
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-2 rounded-[10px] border bg-card p-5 shadow-sm"
    >
      <TextAreaField
        id="summary"
        label="Summary"
        rows={6}
        maxLength={LONG_TEXT_MAX}
        placeholder="Product designer with 7 years of experience shaping healthcare products..."
        error={form.formState.errors.summary?.message}
        {...form.register("summary")}
      />
      <p className="self-end font-mono text-xs text-muted-foreground">
        {summary.length} / {LONG_TEXT_MAX}
      </p>
      <WritingAssist
        groups={SUMMARY_GROUPS}
        onInsert={insert}
        canInsert={(text) => withInserted(summary, text).length <= LONG_TEXT_MAX}
        disabledReason="Summary is at its length limit. Shorten it to insert more."
      />
    </form>
  );
}
