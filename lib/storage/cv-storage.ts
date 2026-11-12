// The only code that touches LocalStorage for CV data. Stored contents are untrusted:
// every read is parsed with the CV schema, and every storage call is guarded.

import { cvDocumentSchema } from "@/lib/validations/cv";
import type { CvDocument } from "@/types/cv";

export const CV_STORAGE_KEY = "resumely:cv";
/** Holds the exact raw value of the last record that could not be read, so it is never silently destroyed. */
export const CV_BACKUP_KEY = "resumely:cv:unreadable";

export type LoadCvResult =
  | { status: "empty" }
  | { status: "restored"; cv: CvDocument }
  | { status: "unreadable" }
  | { status: "unavailable" };

function keepUnreadable(raw: string): LoadCvResult {
  try {
    window.localStorage.setItem(CV_BACKUP_KEY, raw);
  } catch {
    // Best effort: the original value is still in the primary key until the next save.
  }
  return { status: "unreadable" };
}

export function loadCv(): LoadCvResult {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(CV_STORAGE_KEY);
  } catch {
    return { status: "unavailable" };
  }
  if (raw === null) return { status: "empty" };

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return keepUnreadable(raw);
  }
  // Only version 1 exists; any other version fails the schema and is treated as unreadable.
  const parsed = cvDocumentSchema.safeParse(data);
  return parsed.success ? { status: "restored", cv: parsed.data } : keepUnreadable(raw);
}

/** Returns false when the browser refuses the write (storage blocked or full). Never throws. */
export function saveCv(cv: CvDocument): boolean {
  try {
    window.localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(cv));
    return true;
  } catch {
    return false;
  }
}

/** Removes the stored CV and any unreadable backup. Returns false when storage refuses. Never throws. */
export function clearStoredCv(): boolean {
  try {
    window.localStorage.removeItem(CV_STORAGE_KEY);
    window.localStorage.removeItem(CV_BACKUP_KEY);
    return true;
  } catch {
    return false;
  }
}
