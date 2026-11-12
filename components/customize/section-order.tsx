"use client";

import { useId, useRef } from "react";
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
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useCv } from "@/hooks/use-cv";
import { moveSection, setSectionEnabled } from "@/lib/cv/custom-sections";
import { EDITOR_SECTIONS } from "@/lib/cv/sections";
import { CUSTOM_SECTION_PREFIX } from "@/lib/validations/cv";
import { cn } from "@/lib/utils";
import type { CvDocument, SectionKey } from "@/types/cv";

const UNTITLED_CUSTOM = "Untitled custom section";

function sectionLabel(cv: CvDocument, key: SectionKey): string {
  if (key.startsWith(CUSTOM_SECTION_PREFIX)) {
    const id = key.slice(CUSTOM_SECTION_PREFIX.length);
    return cv.customSections.find((section) => section.id === id)?.title.trim() || UNTITLED_CUSTOM;
  }
  return EDITOR_SECTIONS.find((section) => section.sectionKey === key)?.label ?? key;
}

export function SectionOrder() {
  const dndId = useId();
  const { cv, updateCv } = useCv();
  const keys = cv.sections.map((section) => section.key);
  const labelOf = (id: UniqueIdentifier) => sectionLabel(cv, String(id) as SectionKey);
  const positionOf = (id: UniqueIdentifier) => keys.indexOf(String(id) as SectionKey) + 1;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      lastOverId.current = active.id;
      return `Picked up ${labelOf(active.id)}.`;
    },
    onDragOver: ({ active, over }) => {
      // dnd-kit reports "over itself" right after pickup; skip it so the pickup message is not replaced.
      if (!over || over.id === lastOverId.current) return undefined;
      lastOverId.current = over.id;
      return `${labelOf(active.id)} moved to position ${positionOf(over.id)} of ${keys.length}.`;
    },
    onDragEnd: ({ active, over }) =>
      over ? `${labelOf(active.id)} dropped at position ${positionOf(over.id)} of ${keys.length}.` : undefined,
    onDragCancel: ({ active }) => `Moving ${labelOf(active.id)} was cancelled.`,
  };

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = keys.indexOf(String(active.id) as SectionKey);
    const to = keys.indexOf(String(over.id) as SectionKey);
    updateCv((doc) => moveSection(doc, from, to));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-muted-foreground">
        Drag to reorder. Turn a section off to hide it from the CV without deleting it.
      </p>
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        accessibility={{ announcements }}
        onDragEnd={handleDragEnd}
      >
        <ul className="flex flex-col gap-1.5">
          <li className="flex h-10 items-center gap-2 rounded-md border bg-background pr-2 pl-1 text-sm text-muted-foreground">
            <span className="grid w-6 place-items-center opacity-50">
              <Lock aria-hidden="true" className="size-4" />
            </span>
            <span className="flex-1">
              Header and contact<span className="sr-only"> (fixed at top)</span>
            </span>
          </li>
          <SortableContext items={keys} strategy={verticalListSortingStrategy}>
            {cv.sections.map((section) => (
              <SortableRow
                key={section.key}
                id={section.key}
                label={sectionLabel(cv, section.key)}
                enabled={section.enabled}
                onToggle={(enabled) => updateCv((doc) => setSectionEnabled(doc, section.key, enabled))}
              />
            ))}
          </SortableContext>
        </ul>
      </DndContext>
    </div>
  );
}

type SortableRowProps = {
  id: SectionKey;
  label: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
};

function SortableRow({ id, label, enabled, onToggle }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative flex h-10 items-center gap-2 rounded-md border bg-card pr-2 pl-1 text-sm",
        isDragging && "z-10 border-ring shadow-lift",
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${label}`}
        className="grid h-8 w-6 shrink-0 cursor-grab touch-none place-items-center rounded-md text-faint outline-none hover:bg-muted hover:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
      >
        <GripVertical aria-hidden="true" className="size-4" />
      </button>
      <span className={cn("min-w-0 flex-1 truncate", !enabled && "text-faint line-through")}>{label}</span>
      {!enabled ? (
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          Hidden
        </span>
      ) : null}
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        aria-label={`Show ${label} on CV`}
        title={enabled ? "Shown on CV" : "Hidden from CV"}
        className="mx-1"
      />
    </li>
  );
}
