"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextAreaField } from "@/components/editor/text-field";
import { useCv } from "@/hooks/use-cv";
import { useSyncValidFields } from "@/hooks/use-sync-valid-fields";
import { LONG_TEXT_MAX } from "@/lib/validations/cv";
import { summaryFormSchema, type SummaryFormValues } from "@/lib/validations/forms";

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
    </form>
  );
}
