"use client";

import { useCallback } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateField } from "@/components/editor/date-field";
import { EntryList } from "@/components/editor/entry-list";
import { TextAreaField, TextField } from "@/components/editor/text-field";
import { useCv } from "@/hooks/use-cv";
import { useSyncValidFields } from "@/hooks/use-sync-valid-fields";
import { formatCvDateRange, isEndBeforeStart } from "@/lib/cv/dates";
import { createEducationEntry } from "@/lib/cv/document";
import { LONG_TEXT_MAX, SHORT_TEXT_MAX } from "@/lib/validations/cv";
import { educationFormSchema, type EducationFormValues } from "@/lib/validations/forms";
import type { EducationEntry } from "@/types/cv";

export function EducationSection() {
  const { cv, updateCv } = useCv();

  return (
    <EntryList
      entries={cv.education}
      noun="education"
      emptyMessage="No education added yet."
      renderSummary={(entry) => ({
        title: [entry.degree, entry.institution].filter((part) => part.trim()).join(", "),
        subtitle: formatCvDateRange(entry.startDate, entry.endDate, false),
      })}
      renderForm={(entry) => <EducationForm key={entry.id} entry={entry} />}
      onAdd={() => {
        const entry = createEducationEntry();
        updateCv((current) => ({ ...current, education: [...current.education, entry] }));
        return entry.id;
      }}
      onDelete={(id) =>
        updateCv((current) => ({ ...current, education: current.education.filter((item) => item.id !== id) }))
      }
    />
  );
}

function EducationForm({ entry }: { entry: EducationEntry }) {
  const { updateCv } = useCv();
  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationFormSchema),
    mode: "onChange",
    defaultValues: {
      institution: entry.institution,
      degree: entry.degree,
      fieldOfStudy: entry.fieldOfStudy,
      startDate: entry.startDate,
      endDate: entry.endDate,
      description: entry.description,
    },
  });
  const { errors } = form.formState;
  const [startDate, endDate] = useWatch({ control: form.control, name: ["startDate", "endDate"] });
  const showOrderWarning = !errors.startDate && !errors.endDate && isEndBeforeStart(startDate, endDate);
  const warningId = `${entry.id}-date-order`;

  const applyFields = useCallback(
    (fields: Partial<EducationFormValues>) =>
      updateCv((cv) => ({
        ...cv,
        education: cv.education.map((item) => (item.id === entry.id ? { ...item, ...fields } : item)),
      })),
    [entry.id, updateCv],
  );
  useSyncValidFields(form, educationFormSchema, applyFields);

  const field = (key: "institution" | "degree" | "fieldOfStudy") => ({
    ...form.register(key),
    maxLength: SHORT_TEXT_MAX,
    error: errors[key]?.message,
  });

  return (
    <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id={`${entry.id}-degree`} label="Degree" placeholder="MSc Design for Interaction" {...field("degree")} />
        <TextField id={`${entry.id}-institution`} label="Institution" {...field("institution")} />
      </div>
      <TextField id={`${entry.id}-field`} label="Field of study" optional {...field("fieldOfStudy")} />
      <div className="flex flex-col gap-3">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="startDate"
            render={({ field: date }) => (
              <DateField
                id={`${entry.id}-start`}
                legend="Start date"
                value={date.value}
                onChange={date.onChange}
                onBlur={date.onBlur}
                error={errors.startDate?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="endDate"
            render={({ field: date }) => (
              <DateField
                id={`${entry.id}-end`}
                legend="End date"
                value={date.value}
                onChange={date.onChange}
                onBlur={date.onBlur}
                error={errors.endDate?.message}
                describedBy={showOrderWarning ? warningId : undefined}
              />
            )}
          />
        </div>
        {showOrderWarning ? (
          <p id={warningId} className="text-xs text-warning">
            End date is before start date.
          </p>
        ) : null}
      </div>
      <TextAreaField
        id={`${entry.id}-description`}
        label="Description"
        optional
        rows={4}
        maxLength={LONG_TEXT_MAX}
        placeholder="Thesis, honors, or relevant coursework"
        error={errors.description?.message}
        {...form.register("description")}
      />
    </form>
  );
}
