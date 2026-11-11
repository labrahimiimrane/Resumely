"use client";

import { useEffect, useRef } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { useCv } from "@/hooks/use-cv";
import type { CvDocument } from "@/types/cv";

type ObjectSchema<T extends FieldValues> = z.ZodObject<{ [K in keyof T]: z.ZodType<T[K]> }>;
type ApplyFields<T> = (cv: CvDocument, fields: Partial<T>) => CvDocument;

/** Writes each valid changed field to the CV; edits to one field within the coalesce window form one undo step. */
export function useSyncValidFields<T extends FieldValues>(
  form: UseFormReturn<T>,
  schema: ObjectSchema<T>,
  apply: ApplyFields<T>,
  scope: string,
) {
  const { updateCv } = useCv();
  const applyRef = useRef(apply);

  useEffect(() => {
    applyRef.current = apply;
  }, [apply]);

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      const topLevel = name?.split(".")[0];
      if (!topLevel || !(topLevel in schema.shape)) return;
      const key = topLevel as keyof T & string;
      const result = schema.shape[key].safeParse(values[key]);
      if (!result.success) return;
      const fields = { [key]: result.data } as Partial<T>;
      updateCv((cv) => applyRef.current(cv, fields), { coalesceKey: `${scope}:${key}` });
    });
    return () => subscription.unsubscribe();
  }, [form, schema, scope, updateCv]);
}
