"use client";

import { useEffect, useRef } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import type { z } from "zod";

type ObjectSchema<T extends FieldValues> = z.ZodObject<{ [K in keyof T]: z.ZodType<T[K]> }>;

export function useSyncValidFields<T extends FieldValues>(
  form: UseFormReturn<T>,
  schema: ObjectSchema<T>,
  onValidFields: (fields: Partial<T>) => void,
) {
  const onValidRef = useRef(onValidFields);

  useEffect(() => {
    onValidRef.current = onValidFields;
  }, [onValidFields]);

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (!name || !(name in schema.shape)) return;
      const key = name as keyof T & string;
      const result = schema.shape[key].safeParse(values[key]);
      if (result.success) {
        onValidRef.current({ [key]: result.data } as Partial<T>);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, schema]);
}
