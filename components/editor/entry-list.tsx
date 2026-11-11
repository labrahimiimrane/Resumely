"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/editor/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { LIST_MAX } from "@/lib/validations/cv";
import { cn } from "@/lib/utils";

type EntrySummary = { title: string; subtitle: string };

type EntryListProps<T extends { id: string }> = {
  entries: T[];
  noun: string;
  deleteTitle?: string;
  emptyMessage: string;
  renderSummary: (entry: T) => EntrySummary;
  renderForm: (entry: T) => ReactNode;
  onAdd: () => string;
  onDelete: (id: string) => void;
};

export function EntryList<T extends { id: string }>({
  entries,
  noun,
  deleteTitle,
  emptyMessage,
  renderSummary,
  renderForm,
  onAdd,
  onDelete,
}: EntryListProps<T>) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() =>
    entries.length === 1 ? new Set([entries[0].id]) : new Set(),
  );
  const addRef = useRef<HTMLButtonElement>(null);
  const panelRefs = useRef(new Map<string, HTMLDivElement>());
  const pendingFocusId = useRef<string | null>(null);
  const atLimit = entries.length >= LIST_MAX;
  const untitled = `Untitled ${noun}`;

  useEffect(() => {
    const id = pendingFocusId.current;
    if (!id) return;
    pendingFocusId.current = null;
    panelRefs.current.get(id)?.querySelector<HTMLElement>("input, select, textarea")?.focus();
  }, [entries]);

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    const id = onAdd();
    pendingFocusId.current = id;
    setExpanded((current) => new Set(current).add(id));
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-input bg-card px-6 py-8 text-center text-[13px] text-muted-foreground">
          {emptyMessage}
        </p>
      ) : null}

      {entries.map((entry) => {
        const { title, subtitle } = renderSummary(entry);
        const displayTitle = title || untitled;
        const isOpen = expanded.has(entry.id);
        const panelId = `${entry.id}-panel`;
        return (
          <article key={entry.id} className="rounded-[10px] border bg-card shadow-sm">
            <div className="flex items-center gap-1 p-2 pl-3">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(entry.id)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-1.5 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-sm font-medium", !title && "text-muted-foreground")}>
                    {displayTitle}
                  </span>
                  {subtitle ? <span className="block truncate text-xs text-muted-foreground">{subtitle}</span> : null}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")}
                />
              </button>
              <ConfirmDeleteButton
                label={`Delete ${displayTitle}`}
                title={deleteTitle ?? `Delete this ${noun} entry?`}
                description={`"${displayTitle}" will be removed from your CV.`}
                onConfirm={() => onDelete(entry.id)}
                finalFocus={addRef}
              />
            </div>
            <div
              id={panelId}
              hidden={!isOpen}
              ref={(element) => {
                if (element) panelRefs.current.set(entry.id, element);
                else panelRefs.current.delete(entry.id);
              }}
              className="border-t p-5"
            >
              {renderForm(entry)}
            </div>
          </article>
        );
      })}

      <div className="flex flex-col items-start gap-1.5">
        <Button ref={addRef} type="button" variant="outline" size="lg" disabled={atLimit} onClick={handleAdd}>
          <Plus aria-hidden="true" />
          Add {noun}
        </Button>
        {atLimit ? <p className="text-xs text-muted-foreground">You can add up to {LIST_MAX} entries.</p> : null}
      </div>
    </div>
  );
}
