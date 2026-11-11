"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EntryList } from "@/components/editor/entry-list";
import { TagInputField } from "@/components/editor/tag-input-field";
import { TextField } from "@/components/editor/text-field";
import { useCv } from "@/hooks/use-cv";
import { useEntryListActions } from "@/hooks/use-entry-list-actions";
import { useSyncValidFields } from "@/hooks/use-sync-valid-fields";
import { createSkillGroup } from "@/lib/cv/document";
import { SHORT_TEXT_MAX } from "@/lib/validations/cv";
import { skillGroupFormSchema, type SkillGroupFormValues } from "@/lib/validations/forms";
import type { SkillGroup } from "@/types/cv";

function skillsPreview(skills: string[]): string {
  const shown = skills.slice(0, 3).join(", ");
  return skills.length > 3 ? `${shown} +${skills.length - 3} more` : shown;
}

export function SkillsSection() {
  const { cv, updateCv, revision } = useCv();
  const actions = useEntryListActions("skills", "name");

  return (
    <EntryList
      entries={cv.skills}
      {...actions}
      noun="skill group"
      deleteTitle="Delete this skill group?"
      emptyMessage="No skills added yet."
      renderSummary={(group) => ({ title: group.name.trim(), subtitle: skillsPreview(group.skills) })}
      renderForm={(group) => <SkillGroupForm key={`${group.id}:${revision}`} group={group} />}
      onAdd={() => {
        const group = createSkillGroup();
        updateCv((current) => ({ ...current, skills: [...current.skills, group] }));
        return group.id;
      }}
      onDelete={(id) => updateCv((current) => ({ ...current, skills: current.skills.filter((item) => item.id !== id) }))}
    />
  );
}

function SkillGroupForm({ group }: { group: SkillGroup }) {
  const form = useForm<SkillGroupFormValues>({
    resolver: zodResolver(skillGroupFormSchema),
    mode: "onChange",
    defaultValues: { name: group.name, skills: group.skills },
  });

  useSyncValidFields(
    form,
    skillGroupFormSchema,
    (cv, fields: Partial<SkillGroupFormValues>) => ({
      ...cv,
      skills: cv.skills.map((item) => (item.id === group.id ? { ...item, ...fields } : item)),
    }),
    group.id,
  );

  return (
    <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-5">
      <TextField
        id={`${group.id}-name`}
        label="Group name"
        placeholder="Tools, Languages, Soft skills"
        maxLength={SHORT_TEXT_MAX}
        error={form.formState.errors.name?.message}
        {...form.register("name")}
      />
      <Controller
        control={form.control}
        name="skills"
        render={({ field }) => (
          <TagInputField
            id={`${group.id}-skills`}
            label="Skills"
            placeholder="Figma, Prototyping, User research"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </form>
  );
}
