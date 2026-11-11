"use client";

import { useCv } from "@/hooks/use-cv";
import { createId } from "@/lib/cv/document";
import { duplicateItem, moveItem } from "@/lib/cv/entries";
import type { CvDocument } from "@/types/cv";

type ToggleableListKey = "experience" | "education" | "skills" | "projects" | "certifications" | "languages";
type ListEntry<K extends ToggleableListKey> = CvDocument[K][number];

export function useEntryListActions<K extends ToggleableListKey>(key: K, titleKey: keyof ListEntry<K> & string) {
  const { updateCv } = useCv();

  const setList = (update: (list: ListEntry<K>[]) => ListEntry<K>[]) =>
    updateCv((cv) => ({ ...cv, [key]: update(cv[key] as ListEntry<K>[]) }));

  return {
    isEnabled: (entry: ListEntry<K>) => entry.enabled,
    onToggle: (id: string, enabled: boolean) =>
      setList((list) => list.map((item) => (item.id === id ? { ...item, enabled } : item))),
    onDuplicate: (id: string) => {
      const newId = createId();
      setList((list) => duplicateItem(list, id, titleKey, newId));
      return newId;
    },
    onMove: (from: number, to: number) => setList((list) => moveItem(list, from, to)),
  };
}
