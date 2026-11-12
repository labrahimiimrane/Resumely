"use client";

import { useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LIST_MAX, SHORT_TEXT_MAX } from "@/lib/validations/cv";

type TagInputFieldProps = {
  id: string;
  label: string;
  optional?: boolean;
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
};

export function mergeTags(current: string[], candidates: string[]): string[] {
  const seen = new Set(current.map((tag) => tag.toLowerCase()));
  const next = [...current];
  for (const raw of candidates) {
    const tag = raw.trim().slice(0, SHORT_TEXT_MAX);
    if (!tag || seen.has(tag.toLowerCase()) || next.length >= LIST_MAX) continue;
    seen.add(tag.toLowerCase());
    next.push(tag);
  }
  return next;
}

export function TagInputField({ id, label, optional, placeholder, value, onChange }: TagInputFieldProps) {
  const [draft, setDraft] = useState("");
  const atLimit = value.length >= LIST_MAX;
  const hintId = `${id}-hint`;

  function commit(candidates: string[]) {
    const next = mergeTags(value, candidates);
    if (next.length !== value.length) onChange(next);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit([draft]);
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      event.preventDefault();
      onChange(value.slice(0, -1));
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text");
    if (!text.includes(",")) return;
    event.preventDefault();
    commit((draft + text).split(","));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-[13px]">
        {label}
        {optional ? <span className="font-normal text-faint">(optional)</span> : null}
      </Label>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-input p-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
        {value.length > 0 ? (
          <ul aria-label={`${label} added`} className="contents">
            {value.map((tag) => (
              <li
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border bg-card py-0.5 pr-1 pl-2.5 text-xs"
              >
                {tag}
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  onClick={() => onChange(value.filter((item) => item !== tag))}
                  className="grid size-4 place-items-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <X aria-hidden="true" className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <Input
          id={id}
          value={draft}
          maxLength={SHORT_TEXT_MAX}
          placeholder={value.length === 0 ? placeholder : undefined}
          disabled={atLimit}
          aria-describedby={hintId}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => {
            if (draft.trim()) commit([draft]);
          }}
          className="h-7 min-w-32 flex-1 border-0 bg-transparent px-1.5 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
      </div>
      <p id={hintId} className="text-xs text-muted-foreground">
        {atLimit ? `You can add up to ${LIST_MAX}.` : "Press Enter or comma to add."}
      </p>
    </div>
  );
}
