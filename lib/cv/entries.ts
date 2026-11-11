import { SHORT_TEXT_MAX } from "@/lib/validations/cv";

const COPY_SUFFIX = " (copy)";

export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  const inRange = (index: number) => Number.isInteger(index) && index >= 0 && index < list.length;
  if (from === to || !inRange(from) || !inRange(to)) return next;
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function copyTitle(title: string): string {
  if (!title) return title;
  return title.slice(0, SHORT_TEXT_MAX - COPY_SUFFIX.length) + COPY_SUFFIX;
}

export function duplicateItem<T extends { id: string }>(
  list: readonly T[],
  id: string,
  titleKey: keyof T & string,
  newId: string,
): T[] {
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return [...list];
  const original = list[index];
  const copy: T = { ...structuredClone(original), id: newId };
  const title = original[titleKey];
  if (typeof title === "string") {
    (copy as Record<string, unknown>)[titleKey] = copyTitle(title);
  }
  return [...list.slice(0, index + 1), copy, ...list.slice(index + 1)];
}
