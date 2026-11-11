import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FieldProps = {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  className?: string;
};

function describe({ id, hint, error }: FieldProps) {
  const ids = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean);
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": ids.length ? ids.join(" ") : undefined,
  };
}

function FieldShell({ id, label, optional, hint, error, className, children }: FieldProps & { children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} className="text-[13px]">
        {label}
        {optional ? <span className="font-normal text-faint">(optional)</span> : null}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  id,
  label,
  optional,
  hint,
  error,
  className,
  ...inputProps
}: FieldProps & Omit<ComponentProps<"input">, "id" | "className">) {
  const field = { id, label, optional, hint, error, className };
  return (
    <FieldShell {...field}>
      <Input {...inputProps} {...describe(field)} className="h-9 text-sm" />
    </FieldShell>
  );
}

export function TextAreaField({
  id,
  label,
  optional,
  hint,
  error,
  className,
  ...textareaProps
}: FieldProps & Omit<ComponentProps<"textarea">, "id" | "className">) {
  const field = { id, label, optional, hint, error, className };
  return (
    <FieldShell {...field}>
      <Textarea {...textareaProps} {...describe(field)} className="min-h-32 text-sm leading-relaxed" />
    </FieldShell>
  );
}
