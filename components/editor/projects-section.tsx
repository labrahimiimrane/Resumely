"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EntryList } from "@/components/editor/entry-list";
import { TagInputField } from "@/components/editor/tag-input-field";
import { TextAreaField, TextField } from "@/components/editor/text-field";
import { useCv } from "@/hooks/use-cv";
import { useEntryListActions } from "@/hooks/use-entry-list-actions";
import { useSyncValidFields } from "@/hooks/use-sync-valid-fields";
import { createProjectEntry } from "@/lib/cv/document";
import { LONG_TEXT_MAX, SHORT_TEXT_MAX, URL_MAX } from "@/lib/validations/cv";
import { projectFormSchema, type ProjectFormValues } from "@/lib/validations/forms";
import type { ProjectEntry } from "@/types/cv";

export function ProjectsSection() {
  const { cv, updateCv, revision } = useCv();
  const actions = useEntryListActions("projects", "name");

  return (
    <EntryList
      entries={cv.projects}
      {...actions}
      noun="project"
      deleteTitle="Delete this project?"
      emptyMessage="No projects added yet."
      renderSummary={(project) => ({ title: project.name.trim(), subtitle: project.technologies.join(", ") })}
      renderForm={(project) => <ProjectForm key={`${project.id}:${revision}`} project={project} />}
      onAdd={() => {
        const project = createProjectEntry();
        updateCv((current) => ({ ...current, projects: [...current.projects, project] }));
        return project.id;
      }}
      onDelete={(id) =>
        updateCv((current) => ({ ...current, projects: current.projects.filter((item) => item.id !== id) }))
      }
    />
  );
}

function ProjectForm({ project }: { project: ProjectEntry }) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    mode: "onChange",
    defaultValues: {
      name: project.name,
      description: project.description,
      technologies: project.technologies,
      projectUrl: project.projectUrl,
      githubUrl: project.githubUrl,
    },
  });
  const { errors } = form.formState;

  useSyncValidFields(
    form,
    projectFormSchema,
    (cv, fields: Partial<ProjectFormValues>) => ({
      ...cv,
      projects: cv.projects.map((item) => (item.id === project.id ? { ...item, ...fields } : item)),
    }),
    project.id,
  );

  const urlField = (key: "projectUrl" | "githubUrl") => ({
    ...form.register(key),
    maxLength: URL_MAX,
    inputMode: "url" as const,
    autoComplete: "url",
    error: errors[key]?.message,
  });

  return (
    <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-5">
      <TextField
        id={`${project.id}-name`}
        label="Project name"
        maxLength={SHORT_TEXT_MAX}
        error={errors.name?.message}
        {...form.register("name")}
      />
      <TextAreaField
        id={`${project.id}-description`}
        label="Description"
        optional
        rows={3}
        maxLength={LONG_TEXT_MAX}
        placeholder="What it does, your role, and the result"
        error={errors.description?.message}
        {...form.register("description")}
      />
      <Controller
        control={form.control}
        name="technologies"
        render={({ field }) => (
          <TagInputField
            id={`${project.id}-technologies`}
            label="Technologies"
            optional
            placeholder="React, TypeScript, Figma"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={`${project.id}-url`}
          label="Project URL"
          optional
          placeholder="yourproject.com"
          {...urlField("projectUrl")}
        />
        <TextField
          id={`${project.id}-github`}
          label="GitHub"
          optional
          placeholder="github.com/you/project"
          {...urlField("githubUrl")}
        />
      </div>
    </form>
  );
}
