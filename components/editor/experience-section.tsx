"use client";

import { useId, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BulletListField, type BulletAssistProps } from "@/components/editor/bullet-list-field";
import { DateField } from "@/components/editor/date-field";
import { EntryList } from "@/components/editor/entry-list";
import { TextField } from "@/components/editor/text-field";
import { WritingAssist, type AssistGroup } from "@/components/editor/writing-assist";
import { useCv } from "@/hooks/use-cv";
import { useEntryListActions } from "@/hooks/use-entry-list-actions";
import { useSyncValidFields } from "@/hooks/use-sync-valid-fields";
import { formatCvDateRange, isEndBeforeStart } from "@/lib/cv/dates";
import { createExperienceEntry } from "@/lib/cv/document";
import { LIST_MAX, SHORT_TEXT_MAX } from "@/lib/validations/cv";
import { experienceFormSchema, type ExperienceFormValues } from "@/lib/validations/forms";
import { ACHIEVEMENT_EXAMPLES, ACTION_VERB_GROUPS } from "@/lib/writing/suggestions";
import type { ExperienceEntry } from "@/types/cv";

export function ExperienceSection() {
  const { cv, updateCv, revision } = useCv();
  const actions = useEntryListActions("experience", "jobTitle");

  return (
    <EntryList
      entries={cv.experience}
      {...actions}
      noun="experience"
      emptyMessage="No experience added yet."
      renderSummary={(entry) => ({
        title: [entry.jobTitle, entry.company].filter((part) => part.trim()).join(", "),
        subtitle: formatCvDateRange(entry.startDate, entry.endDate, entry.current),
      })}
      renderForm={(entry) => <ExperienceForm key={`${entry.id}:${revision}`} entry={entry} />}
      onAdd={() => {
        const entry = createExperienceEntry();
        updateCv((current) => ({ ...current, experience: [...current.experience, entry] }));
        return entry.id;
      }}
      onDelete={(id) =>
        updateCv((current) => ({ ...current, experience: current.experience.filter((item) => item.id !== id) }))
      }
    />
  );
}

function ExperienceForm({ entry }: { entry: ExperienceEntry }) {
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    mode: "onChange",
    defaultValues: {
      jobTitle: entry.jobTitle,
      company: entry.company,
      location: entry.location,
      startDate: entry.startDate,
      endDate: entry.endDate,
      current: entry.current,
      responsibilities: entry.responsibilities,
      achievements: entry.achievements,
    },
  });
  const { errors } = form.formState;
  const [startDate, endDate, current] = useWatch({
    control: form.control,
    name: ["startDate", "endDate", "current"],
  });
  const showOrderWarning = !current && !errors.startDate && !errors.endDate && isEndBeforeStart(startDate, endDate);
  const warningId = `${entry.id}-date-order`;

  useSyncValidFields(
    form,
    experienceFormSchema,
    (cv, fields: Partial<ExperienceFormValues>) => ({
      ...cv,
      experience: cv.experience.map((item) => (item.id === entry.id ? { ...item, ...fields } : item)),
    }),
    entry.id,
  );

  const field = (key: "jobTitle" | "company" | "location") => ({
    ...form.register(key),
    maxLength: SHORT_TEXT_MAX,
    error: errors[key]?.message,
  });

  return (
    <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id={`${entry.id}-job-title`} label="Job title" {...field("jobTitle")} />
        <TextField id={`${entry.id}-company`} label="Company" autoComplete="organization" {...field("company")} />
      </div>
      <TextField
        id={`${entry.id}-location`}
        label="Location"
        optional
        placeholder="City, Country or Remote"
        {...field("location")}
      />
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
                disabled={current}
                error={current ? undefined : errors.endDate?.message}
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
        <label className="flex w-fit items-center gap-2 text-[13px] text-muted-foreground">
          <input type="checkbox" className="size-4 accent-primary" {...form.register("current")} />
          I currently work here
        </label>
      </div>
      <Controller
        control={form.control}
        name="responsibilities"
        render={({ field: list }) => (
          <BulletListField
            id={`${entry.id}-responsibilities`}
            legend="Responsibilities"
            singular="responsibility"
            value={list.value}
            onChange={list.onChange}
          />
        )}
      />
      <Controller
        control={form.control}
        name="achievements"
        render={({ field: list }) => (
          <BulletListField
            id={`${entry.id}-achievements`}
            legend="Achievements"
            singular="achievement"
            hint="Press Enter for a new bullet. Start with an action verb and a result."
            value={list.value}
            onChange={list.onChange}
            assist={AchievementsAssist}
          />
        )}
      />
    </form>
  );
}

const ACHIEVEMENT_EXAMPLE_GROUP: AssistGroup = {
  label: "Achievement examples",
  layout: "block",
  items: ACHIEVEMENT_EXAMPLES,
  itemLabel: (_, index) => `Insert achievement example ${index + 1}`,
};

function AchievementsAssist({ append, canAdd }: BulletAssistProps) {
  const selectId = useId();
  const [categoryId, setCategoryId] = useState(ACTION_VERB_GROUPS[0].id);
  const category = ACTION_VERB_GROUPS.find((group) => group.id === categoryId) ?? ACTION_VERB_GROUPS[0];
  const verbGroup: AssistGroup = {
    label: `Action verbs for ${category.label.toLowerCase()}`,
    layout: "chip",
    items: category.verbs,
    itemLabel: (verb) => `Insert action verb "${verb}"`,
    insertText: (verb) => `${verb} `,
  };

  return (
    <WritingAssist
      groups={[verbGroup, ACHIEVEMENT_EXAMPLE_GROUP]}
      onInsert={append}
      canInsert={() => canAdd}
      disabledReason={`Achievement list is full (${LIST_MAX}). Remove a bullet to insert more.`}
      controls={
        <div className="flex items-center gap-2">
          <label htmlFor={selectId} className="text-xs text-muted-foreground">
            Verb category
          </label>
          <select
            id={selectId}
            value={category.id}
            onChange={(event) => setCategoryId(event.target.value)}
            className="h-7 rounded-md border border-input bg-card px-2 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {ACTION_VERB_GROUPS.map((group) => (
              <option key={group.id} value={group.id}>
                {group.label}
              </option>
            ))}
          </select>
        </div>
      }
    />
  );
}
