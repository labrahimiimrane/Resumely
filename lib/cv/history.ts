import type { CvDocument } from "@/types/cv";

export const HISTORY_LIMIT = 100;
export const COALESCE_MS = 1000;

export type History = {
  past: CvDocument[];
  present: CvDocument;
  future: CvDocument[];
  lastKey: string | null;
  lastAt: number;
};

export function createHistory(initial: CvDocument): History {
  return { past: [], present: initial, future: [], lastKey: null, lastAt: 0 };
}

export function commit(history: History, next: CvDocument, options: { key?: string | null; now: number }): History {
  if (next === history.present) return history;
  const key = options.key ?? null;
  const coalesce = key !== null && key === history.lastKey && options.now - history.lastAt <= COALESCE_MS;
  if (coalesce) {
    return { ...history, present: next, future: [], lastAt: options.now };
  }
  const past = [...history.past, history.present];
  return {
    past: past.length > HISTORY_LIMIT ? past.slice(past.length - HISTORY_LIMIT) : past,
    present: next,
    future: [],
    lastKey: key,
    lastAt: options.now,
  };
}

export function undo(history: History): History {
  if (history.past.length === 0) return history;
  return {
    past: history.past.slice(0, -1),
    present: history.past[history.past.length - 1],
    future: [history.present, ...history.future],
    lastKey: null,
    lastAt: history.lastAt,
  };
}

export function redo(history: History): History {
  if (history.future.length === 0) return history;
  return {
    past: [...history.past, history.present],
    present: history.future[0],
    future: history.future.slice(1),
    lastKey: null,
    lastAt: history.lastAt,
  };
}
