"use client";

import { useEffect, useRef, type ComponentType, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BULLET_MAX, LIST_MAX } from "@/lib/validations/cv";

export type BulletAssistProps = { append: (text: string) => void; canAdd: boolean };

type BulletListFieldProps = {
  id: string;
  legend: string;
  singular: string;
  hint?: string;
  value: string[];
  onChange: (value: string[]) => void;
  /** Optional writing help below the add row; `append` fills a trailing empty bullet or adds a new one. */
  assist?: ComponentType<BulletAssistProps>;
};

export function BulletListField({ id, legend, singular, hint, value, onChange, assist: Assist }: BulletListFieldProps) {
  const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const addRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<number | null>(null);
  const capitalized = singular.charAt(0).toUpperCase() + singular.slice(1);
  const canAdd = value.length < LIST_MAX;

  useEffect(() => {
    const index = pendingFocus.current;
    if (index === null) return;
    pendingFocus.current = null;
    const target = index < 0 ? addRef.current : inputRefs.current[index];
    target?.focus();
    if (target instanceof HTMLTextAreaElement) {
      target.setSelectionRange(target.value.length, target.value.length);
    }
  }, [value]);

  function insertAfter(index: number) {
    if (!canAdd) return;
    pendingFocus.current = index + 1;
    onChange([...value.slice(0, index + 1), "", ...value.slice(index + 1)]);
  }

  const lastIndex = value.length - 1;
  const hasTrailingEmpty = lastIndex >= 0 && value[lastIndex].trim() === "";

  function append(text: string) {
    if (hasTrailingEmpty) {
      pendingFocus.current = lastIndex;
      onChange(value.map((item, i) => (i === lastIndex ? text : item)));
    } else if (canAdd) {
      pendingFocus.current = value.length;
      onChange([...value, text]);
    }
  }

  function removeAt(index: number) {
    pendingFocus.current = index > 0 ? index - 1 : value.length > 1 ? 0 : -1;
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>, index: number) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      insertAfter(index);
    } else if (event.key === "Backspace" && value[index] === "") {
      event.preventDefault();
      removeAt(index);
    }
  }

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-1.5 text-[13px] font-medium">{legend}</legend>
      {value.map((bullet, index) => (
        <div key={index} className="flex items-start gap-2">
          <Textarea
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            id={`${id}-${index}`}
            aria-label={`${capitalized} ${index + 1}`}
            rows={1}
            maxLength={BULLET_MAX}
            value={bullet}
            onChange={(event) => onChange(value.map((item, i) => (i === index ? event.target.value : item)))}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className="min-h-9 text-sm leading-relaxed"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove ${singular} ${index + 1}`}
            onClick={() => removeAt(index)}
            className="mt-0.5 text-muted-foreground"
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          ref={addRef}
          type="button"
          variant="outline"
          disabled={!canAdd}
          onClick={() => insertAfter(value.length - 1)}
        >
          <Plus aria-hidden="true" />
          Add {singular}
        </Button>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {Assist ? <Assist append={append} canAdd={canAdd || hasTrailingEmpty} /> : null}
    </fieldset>
  );
}
