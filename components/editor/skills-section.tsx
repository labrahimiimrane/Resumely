"use client";

import { useId, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EntryList } from "@/components/editor/entry-list";
import { mergeTags, TagInputField } from "@/components/editor/tag-input-field";
import { TextField } from "@/components/editor/text-field";
import { WritingAssist, type AssistGroup } from "@/components/editor/writing-assist";
import { useCv } from "@/hooks/use-cv";
import { useEntryListActions } from "@/hooks/use-entry-list-actions";
import { useSyncValidFields } from "@/hooks/use-sync-valid-fields";
import { createSkillGroup } from "@/lib/cv/document";
import { LIST_MAX, SHORT_TEXT_MAX } from "@/lib/validations/cv";
import { skillGroupFormSchema, type SkillGroupFormValues } from "@/lib/validations/forms";
import { SKILL_AREAS } from "@/lib/writing/suggestions";
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

  const skills = useWatch({ control: form.control, name: "skills" });
  const [areaId, setAreaId] = useState(SKILL_AREAS[0].id);
  const area = SKILL_AREAS.find((item) => item.id === areaId) ?? SKILL_AREAS[0];
  const selectId = useId();
  const inputId = `${group.id}-skills`;
  const added = new Set(skills.map((skill) => skill.trim().toLowerCase()));
  const full = skills.length >= LIST_MAX;

  const areaGroup: AssistGroup = {
    label: `${area.label} skills and keywords`,
    layout: "chip",
    items: area.items,
    itemLabel: (item) => `Add skill "${item}"`,
  };

  function insert(item: string) {
    const next = mergeTags(form.getValues("skills"), [item]);
    form.setValue("skills", next, { shouldValidate: true, shouldDirty: true });
    // The clicked chip is now disabled, so keep focus on a usable control.
    const target = document.getElementById(next.length >= LIST_MAX ? selectId : inputId);
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) target.focus();
  }

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
            id={inputId}
            label="Skills"
            placeholder="Figma, Prototyping, User research"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <WritingAssist
        groups={[areaGroup]}
        onInsert={insert}
        canInsert={(item) => !full && !added.has(item.trim().toLowerCase())}
        disabledReason={
          full
            ? `Skill list is full (${LIST_MAX}). Remove a skill to add more.`
            : "Skills already in this group are unavailable."
        }
        controls={
          <div className="flex items-center gap-2">
            <label htmlFor={selectId} className="text-xs text-muted-foreground">
              Area
            </label>
            <select
              id={selectId}
              value={area.id}
              onChange={(event) => setAreaId(event.target.value)}
              className="h-7 rounded-md border border-input bg-card px-2 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {SKILL_AREAS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        }
      />
    </form>
  );
}
