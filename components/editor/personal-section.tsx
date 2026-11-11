"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PhotoField } from "@/components/editor/photo-field";
import { TextField } from "@/components/editor/text-field";
import { useCv } from "@/hooks/use-cv";
import { useSyncValidFields } from "@/hooks/use-sync-valid-fields";
import { getCvDisplayName } from "@/lib/cv/document";
import { SHORT_TEXT_MAX, URL_MAX } from "@/lib/validations/cv";
import { personalFormSchema, type PersonalFormValues } from "@/lib/validations/forms";

export function PersonalSection() {
  const { cv } = useCv();
  const form = useForm<PersonalFormValues>({
    resolver: zodResolver(personalFormSchema),
    mode: "onChange",
    defaultValues: {
      name: cv.name,
      fullName: cv.personal.fullName,
      title: cv.personal.title,
      email: cv.personal.email,
      phone: cv.personal.phone,
      location: cv.personal.location,
      linkedinUrl: cv.personal.linkedinUrl,
      portfolioUrl: cv.personal.portfolioUrl,
      githubUrl: cv.personal.githubUrl,
    },
  });
  const { errors } = form.formState;

  useSyncValidFields(
    form,
    personalFormSchema,
    (current, fields: Partial<PersonalFormValues>) => {
      const { name, ...personal } = fields;
      return {
        ...current,
        name: name ?? current.name,
        personal: { ...current.personal, ...personal },
      };
    },
    "personal",
  );

  const shortField = (key: Exclude<keyof PersonalFormValues, "linkedinUrl" | "portfolioUrl" | "githubUrl">) => ({
    ...form.register(key),
    maxLength: SHORT_TEXT_MAX,
    error: errors[key]?.message,
  });
  const urlField = (key: "linkedinUrl" | "portfolioUrl" | "githubUrl") => ({
    ...form.register(key),
    maxLength: URL_MAX,
    inputMode: "url" as const,
    autoComplete: "url",
    error: errors[key]?.message,
  });

  return (
    <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-[10px] border bg-card p-5 shadow-sm">
        <TextField
          id="cv-name"
          label="CV name"
          optional
          placeholder={getCvDisplayName({ ...cv, name: "" })}
          hint="Shown in the header and used for file names. Leave blank to use your full name."
          {...shortField("name")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="full-name" label="Full name" autoComplete="name" {...shortField("fullName")} />
          <TextField
            id="title"
            label="Professional title"
            autoComplete="organization-title"
            {...shortField("title")}
          />
          <TextField id="email" label="Email" type="email" autoComplete="email" {...shortField("email")} />
          <TextField id="phone" label="Phone" type="tel" autoComplete="tel" {...shortField("phone")} />
        </div>
        <TextField
          id="location"
          label="Location"
          optional
          placeholder="City, Country"
          autoComplete="address-level2"
          {...shortField("location")}
        />
      </div>

      <div className="flex flex-col gap-4 rounded-[10px] border bg-card p-5 shadow-sm">
        <p className="text-[13px] font-medium">Links</p>
        <TextField
          id="linkedin-url"
          label="LinkedIn"
          optional
          placeholder="linkedin.com/in/your-name"
          {...urlField("linkedinUrl")}
        />
        <TextField
          id="portfolio-url"
          label="Portfolio or website"
          optional
          placeholder="yourname.com"
          {...urlField("portfolioUrl")}
        />
        <TextField id="github-url" label="GitHub" optional placeholder="github.com/your-name" {...urlField("githubUrl")} />
      </div>

      <PhotoField />
    </form>
  );
}
