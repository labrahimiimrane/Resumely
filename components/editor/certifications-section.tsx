"use client";

import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateField } from "@/components/editor/date-field";
import { EntryList } from "@/components/editor/entry-list";
import { TextField } from "@/components/editor/text-field";
import { useCv } from "@/hooks/use-cv";
import { useSyncValidFields } from "@/hooks/use-sync-valid-fields";
import { formatCvDate } from "@/lib/cv/dates";
import { createCertificationEntry } from "@/lib/cv/document";
import { SHORT_TEXT_MAX, URL_MAX } from "@/lib/validations/cv";
import { certificationFormSchema, type CertificationFormValues } from "@/lib/validations/forms";
import type { CertificationEntry } from "@/types/cv";

export function CertificationsSection() {
  const { cv, updateCv } = useCv();

  return (
    <EntryList
      entries={cv.certifications}
      noun="certification"
      deleteTitle="Delete this certification?"
      emptyMessage="No certifications added yet."
      renderSummary={(item) => ({
        title: item.name.trim(),
        subtitle: [item.issuer.trim(), formatCvDate(item.issueDate)].filter(Boolean).join(", "),
      })}
      renderForm={(item) => <CertificationForm key={item.id} certification={item} />}
      onAdd={() => {
        const item = createCertificationEntry();
        updateCv((current) => ({ ...current, certifications: [...current.certifications, item] }));
        return item.id;
      }}
      onDelete={(id) =>
        updateCv((current) => ({
          ...current,
          certifications: current.certifications.filter((item) => item.id !== id),
        }))
      }
    />
  );
}

function CertificationForm({ certification }: { certification: CertificationEntry }) {
  const { updateCv } = useCv();
  const form = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationFormSchema),
    mode: "onChange",
    defaultValues: {
      name: certification.name,
      issuer: certification.issuer,
      issueDate: certification.issueDate,
      credentialUrl: certification.credentialUrl,
    },
  });
  const { errors } = form.formState;

  const applyFields = useCallback(
    (fields: Partial<CertificationFormValues>) =>
      updateCv((cv) => ({
        ...cv,
        certifications: cv.certifications.map((item) =>
          item.id === certification.id ? { ...item, ...fields } : item,
        ),
      })),
    [certification.id, updateCv],
  );
  useSyncValidFields(form, certificationFormSchema, applyFields);

  return (
    <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={`${certification.id}-name`}
          label="Certification"
          placeholder="Google UX Design Certificate"
          maxLength={SHORT_TEXT_MAX}
          error={errors.name?.message}
          {...form.register("name")}
        />
        <TextField
          id={`${certification.id}-issuer`}
          label="Issuing organization"
          maxLength={SHORT_TEXT_MAX}
          error={errors.issuer?.message}
          {...form.register("issuer")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="issueDate"
          render={({ field }) => (
            <DateField
              id={`${certification.id}-issued`}
              legend="Issue date"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.issueDate?.message}
            />
          )}
        />
        <TextField
          id={`${certification.id}-credential`}
          label="Credential URL"
          optional
          placeholder="credly.com/badges/..."
          maxLength={URL_MAX}
          inputMode="url"
          autoComplete="url"
          error={errors.credentialUrl?.message}
          {...form.register("credentialUrl")}
        />
      </div>
    </form>
  );
}
