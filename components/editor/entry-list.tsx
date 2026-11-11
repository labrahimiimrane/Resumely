"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, Copy, GripVertical, Plus } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/editor/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  isEnabled: (entry: T) => boolean;
  onAdd: () => string;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => string;
  onToggle: (id: string, enabled: boolean) => void;
  onMove: (from: number, to: number) => void;
};

export function EntryList<T extends { id: string }>({
  entries,
  noun,
  deleteTitle,
  emptyMessage,
  renderSummary,
  renderForm,
  isEnabled,
  onAdd,
  onDelete,
  onDuplicate,
  onToggle,
  onMove,
}: EntryListProps<T>) {
  const dndId = useId();
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() =>
    entries.length === 1 ? new Set([entries[0].id]) : new Set(),
  );
  const addRef = useRef<HTMLButtonElement>(null);
  const panelRefs = useRef(new Map<string, HTMLDivElement>());
  const pendingFocusId = useRef<string | null>(null);
  const atLimit = entries.length >= LIST_MAX;
  const untitled = `Untitled ${noun}`;
  const ids = entries.map((entry) => entry.id);
  const titleOf = (id: UniqueIdentifier) => {
    const entry = entries.find((item) => item.id === id);
    return (entry && renderSummary(entry).title) || untitled;
  };
  const positionOf = (id: UniqueIdentifier | undefined) => ids.indexOf(String(id)) + 1;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      lastOverId.current = active.id;
      return `Picked up ${titleOf(active.id)}.`;
    },
    onDragOver: ({ active, over }) => {
      // dnd-kit reports "over itself" right after pickup; skip it so the pickup message is not replaced.
      if (!over || over.id === lastOverId.current) return undefined;
      lastOverId.current = over.id;
      return `${titleOf(active.id)} moved to position ${positionOf(over.id)} of ${ids.length}.`;
    },
    onDragEnd: ({ active, over }) =>
      over ? `${titleOf(active.id)} dropped at position ${positionOf(over.id)} of ${ids.length}.` : undefined,
    onDragCancel: ({ active }) => `Moving ${titleOf(active.id)} was cancelled.`,
  };

  useEffect(() => {
    const id = pendingFocusId.current;
    if (!id) return;
    pendingFocusId.current = null;
    panelRefs.current.get(id)?.querySelector<HTMLElement>("input, select, textarea")?.focus();
  }, [entries]);

  function toggleExpanded(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openAndFocus(id: string) {
    pendingFocusId.current = id;
    setExpanded((current) => new Set(current).add(id));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    onMove(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-input bg-card px-6 py-8 text-center text-[13px] text-muted-foreground">
          {emptyMessage}
        </p>
      ) : null}

      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        accessibility={{ announcements }}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {entries.map((entry) => {
            const { title, subtitle } = renderSummary(entry);
            return (
              <SortableCard
                key={entry.id}
                id={entry.id}
                title={title}
                displayTitle={title || untitled}
                subtitle={subtitle}
                enabled={isEnabled(entry)}
                isOpen={expanded.has(entry.id)}
                canDuplicate={!atLimit}
                deleteTitle={deleteTitle ?? `Delete this ${noun} entry?`}
                addRef={addRef}
                panelRef={(element) => {
                  if (element) panelRefs.current.set(entry.id, element);
                  else panelRefs.current.delete(entry.id);
                }}
                onToggleExpanded={() => toggleExpanded(entry.id)}
                onToggleEnabled={(enabled) => onToggle(entry.id, enabled)}
                onDuplicate={() => openAndFocus(onDuplicate(entry.id))}
                onDelete={() => onDelete(entry.id)}
              >
                {renderForm(entry)}
              </SortableCard>
            );
          })}
        </SortableContext>
      </DndContext>

      <div className="flex flex-col items-start gap-1.5">
        <Button
          ref={addRef}
          type="button"
          variant="outline"
          size="lg"
          disabled={atLimit}
          onClick={() => openAndFocus(onAdd())}
        >
          <Plus aria-hidden="true" />
          Add {noun}
        </Button>
        {atLimit ? <p className="text-xs text-muted-foreground">You can add up to {LIST_MAX} entries.</p> : null}
      </div>
    </div>
  );
}

type SortableCardProps = {
  id: string;
  title: string;
  displayTitle: string;
  subtitle: string;
  enabled: boolean;
  isOpen: boolean;
  canDuplicate: boolean;
  deleteTitle: string;
  addRef: RefObject<HTMLButtonElement | null>;
  panelRef: (element: HTMLDivElement | null) => void;
  onToggleExpanded: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  children: ReactNode;
};

function SortableCard({
  id,
  title,
  displayTitle,
  subtitle,
  enabled,
  isOpen,
  canDuplicate,
  deleteTitle,
  addRef,
  panelRef,
  onToggleExpanded,
  onToggleEnabled,
  onDuplicate,
  onDelete,
  children,
}: SortableCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const panelId = `${id}-panel`;

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative rounded-[10px] border bg-card shadow-sm",
        isDragging && "z-10 shadow-lift",
        !enabled && "bg-card/60",
      )}
    >
      <div className="flex items-center gap-1 p-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${displayTitle}`}
          className="grid h-9 w-6 shrink-0 cursor-grab touch-none place-items-center rounded-md text-faint outline-none hover:bg-muted hover:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
        >
          <GripVertical aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggleExpanded}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-1.5 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className={cn("min-w-0 flex-1", !enabled && "opacity-60")}>
            <span className={cn("block truncate text-sm font-medium", !title && "text-muted-foreground")}>
              {displayTitle}
            </span>
            {subtitle ? <span className="block truncate text-xs text-muted-foreground">{subtitle}</span> : null}
          </span>
          {!enabled ? (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              Hidden
            </span>
          ) : null}
          <ChevronDown
            aria-hidden="true"
            className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")}
          />
        </button>
        <Switch
          checked={enabled}
          onCheckedChange={onToggleEnabled}
          aria-label={`Show ${displayTitle} on CV`}
          title={enabled ? "Shown on CV" : "Hidden from CV"}
          className="mx-1.5"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Duplicate ${displayTitle}`}
          title={`Duplicate ${displayTitle}`}
          disabled={!canDuplicate}
          onClick={onDuplicate}
          className="text-muted-foreground"
        >
          <Copy aria-hidden="true" />
        </Button>
        <ConfirmDeleteButton
          label={`Delete ${displayTitle}`}
          title={deleteTitle}
          description={`"${displayTitle}" will be removed from your CV.`}
          onConfirm={onDelete}
          finalFocus={addRef}
        />
      </div>
      <div id={panelId} hidden={!isOpen} ref={panelRef} className={cn("border-t p-5", !enabled && "opacity-75")}>
        {children}
      </div>
    </article>
  );
}
