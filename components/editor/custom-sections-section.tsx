"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EntryList } from "@/components/editor/entry-list";
import { TextAreaField, TextField } from "@/components/editor/text-field";
import { useCv } from "@/hooks/use-cv";
import { useSyncValidFields } from "@/hooks/use-sync-valid-fields";
import {
  addCustomSection,
  duplicateCustomSection,
  moveCustomSection,
  removeCustomSection,
  setSectionEnabled,
} from "@/lib/cv/custom-sections";
import { createCustomSection, createId } from "@/lib/cv/document";
import { CUSTOM_SECTION_PREFIX } from "@/lib/validations/cv";
import { LONG_TEXT_MAX, SHORT_TEXT_MAX } from "@/lib/validations/cv";
import { customSectionFormSchema, type CustomSectionFormValues } from "@/lib/validations/forms";
import type { CustomSection } from "@/types/cv";

const PREVIEW_LENGTH = 80;

function firstLine(content: string): string {
  const line = content.split("\n").map((part) => part.trim()).find(Boolean) ?? "";
  return line.length > PREVIEW_LENGTH ? `${line.slice(0, PREVIEW_LENGTH)}...` : line;
}

export function CustomSectionsSection() {
  const { cv, updateCv } = useCv();

  return (
    <EntryList
      entries={cv.customSections}
      isEnabled={(section) =>
        cv.sections.find((item) => item.key === `${CUSTOM_SECTION_PREFIX}${section.id}`)?.enabled ?? true
      }
      onToggle={(id, enabled) =>
        updateCv((current) => setSectionEnabled(current, `${CUSTOM_SECTION_PREFIX}${id}`, enabled))
      }
      onDuplicate={(id) => {
        const newId = createId();
        updateCv((current) => duplicateCustomSection(current, id, newId));
        return newId;
      }}
      onMove={(from, to) => updateCv((current) => moveCustomSection(current, from, to))}
      noun="custom section"
      deleteTitle="Delete this custom section?"
      emptyMessage="No custom sections yet. Add one for volunteering, awards, or publications."
      renderSummary={(section) => ({ title: section.title.trim(), subtitle: firstLine(section.content) })}
      renderForm={(section) => <CustomSectionForm key={section.id} section={section} />}
      onAdd={() => {
        const section = createCustomSection();
        updateCv((current) => addCustomSection(current, section));
        return section.id;
      }}
      onDelete={(id) => updateCv((current) => removeCustomSection(current, id))}
    />
  );
}

function CustomSectionForm({ section }: { section: CustomSection }) {
  const { updateCv } = useCv();
  const form = useForm<CustomSectionFormValues>({
    resolver: zodResolver(customSectionFormSchema),
    mode: "onChange",
    defaultValues: { title: section.title, content: section.content },
  });
  const { errors } = form.formState;

  const applyFields = useCallback(
    (fields: Partial<CustomSectionFormValues>) =>
      updateCv((cv) => ({
        ...cv,
        customSections: cv.customSections.map((item) => (item.id === section.id ? { ...item, ...fields } : item)),
      })),
    [section.id, updateCv],
  );
  useSyncValidFields(form, customSectionFormSchema, applyFields);

  return (
    <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-5">
      <TextField
        id={`${section.id}-title`}
        label="Section title"
        placeholder="Volunteering"
        maxLength={SHORT_TEXT_MAX}
        error={errors.title?.message}
        {...form.register("title")}
      />
      <TextAreaField
        id={`${section.id}-content`}
        label="Content"
        rows={5}
        maxLength={LONG_TEXT_MAX}
        error={errors.content?.message}
        {...form.register("content")}
      />
    </form>
  );
}
