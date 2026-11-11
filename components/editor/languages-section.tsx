"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EntryList } from "@/components/editor/entry-list";
import { TextField } from "@/components/editor/text-field";
import { useCv } from "@/hooks/use-cv";
import { useEntryListActions } from "@/hooks/use-entry-list-actions";
import { useSyncValidFields } from "@/hooks/use-sync-valid-fields";
import { createLanguageEntry } from "@/lib/cv/document";
import { SHORT_TEXT_MAX } from "@/lib/validations/cv";
import { languageFormSchema, type LanguageFormValues } from "@/lib/validations/forms";
import type { LanguageEntry } from "@/types/cv";

export function LanguagesSection() {
  const { cv, updateCv } = useCv();
  const actions = useEntryListActions("languages", "language");

  return (
    <EntryList
      entries={cv.languages}
      {...actions}
      noun="language"
      deleteTitle="Delete this language?"
      emptyMessage="No languages added yet."
      renderSummary={(item) => ({ title: item.language.trim(), subtitle: item.proficiency.trim() })}
      renderForm={(item) => <LanguageForm key={item.id} language={item} />}
      onAdd={() => {
        const item = createLanguageEntry();
        updateCv((current) => ({ ...current, languages: [...current.languages, item] }));
        return item.id;
      }}
      onDelete={(id) =>
        updateCv((current) => ({ ...current, languages: current.languages.filter((item) => item.id !== id) }))
      }
    />
  );
}

function LanguageForm({ language }: { language: LanguageEntry }) {
  const { updateCv } = useCv();
  const form = useForm<LanguageFormValues>({
    resolver: zodResolver(languageFormSchema),
    mode: "onChange",
    defaultValues: { language: language.language, proficiency: language.proficiency },
  });
  const { errors } = form.formState;

  const applyFields = useCallback(
    (fields: Partial<LanguageFormValues>) =>
      updateCv((cv) => ({
        ...cv,
        languages: cv.languages.map((item) => (item.id === language.id ? { ...item, ...fields } : item)),
      })),
    [language.id, updateCv],
  );
  useSyncValidFields(form, languageFormSchema, applyFields);

  return (
    <form noValidate onSubmit={(event) => event.preventDefault()} className="grid gap-4 sm:grid-cols-2">
      <TextField
        id={`${language.id}-language`}
        label="Language"
        maxLength={SHORT_TEXT_MAX}
        error={errors.language?.message}
        {...form.register("language")}
      />
      <TextField
        id={`${language.id}-proficiency`}
        label="Proficiency"
        placeholder="Native, Fluent, B2"
        maxLength={SHORT_TEXT_MAX}
        error={errors.proficiency?.message}
        {...form.register("proficiency")}
      />
    </form>
  );
}
