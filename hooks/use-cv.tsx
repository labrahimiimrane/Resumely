"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { createEmptyCv } from "@/lib/cv/document";
import { commit, createHistory, redo as redoHistory, undo as undoHistory, type History } from "@/lib/cv/history";
import { loadCv, saveCv } from "@/lib/storage/cv-storage";
import type { CvDocument } from "@/types/cv";

/** Autosave waits this long after the last change; leaving the page saves immediately. */
const AUTOSAVE_DELAY_MS = 500;

const LOAD_MESSAGES = {
  unreadable:
    "Your saved CV couldn't be read, so a new CV was started. The unreadable copy was kept in this browser.",
  unavailable: "Autosave isn't available in this browser. Your changes will be lost when you close this tab.",
} as const;
const SAVE_FAILED_MESSAGE =
  "Couldn't save your CV in this browser. Your changes are still open in this tab, but may be lost if you close it.";

type CvUpdater = (current: CvDocument) => CvDocument;
type UpdateOptions = { coalesceKey?: string };

type CvContextValue = {
  cv: CvDocument;
  updateCv: (updater: CvUpdater, options?: UpdateOptions) => void;
  /** Replaces the whole CV as one undoable step and remounts the editor forms. */
  replaceCv: (cv: CvDocument) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  revision: number;
};

type StoreState = { history: History; revision: number };

const CvContext = createContext<CvContextValue | null>(null);

const subscribeNothing = () => () => {};

/**
 * Renders `fallback` on the server and during hydration, then mounts the CV store, which reads
 * LocalStorage once. Nothing is saved before that read, so the initial empty CV never
 * overwrites a stored one.
 */
export function CvProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const hydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  return hydrated ? <LoadedCvProvider>{children}</LoadedCvProvider> : fallback;
}

function LoadedCvProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(loadCv);
  const [state, setState] = useState<StoreState>(() => ({
    history: createHistory(loaded.status === "restored" ? loaded.cv : createEmptyCv()),
    revision: 0,
  }));
  const { history, revision } = state;
  const present = history.present;

  // Autosave. The loaded document counts as saved: a restored CV is already stored, and an
  // empty or unreadable start writes nothing until the first edit.
  const savedRef = useRef<CvDocument>(present);
  const latestRef = useRef<CvDocument>(present);
  // One error toast per run of failed saves; a successful save re-arms it.
  const saveFailingRef = useRef(false);

  const flush = useCallback(() => {
    const cv = latestRef.current;
    if (cv === savedRef.current) return;
    if (saveCv(cv)) {
      savedRef.current = cv;
      saveFailingRef.current = false;
    } else if (!saveFailingRef.current) {
      saveFailingRef.current = true;
      toast.error(SAVE_FAILED_MESSAGE, { id: "cv-save-failed" });
    }
  }, []);

  // A fixed id keeps the warning single even when development re-runs effects.
  useEffect(() => {
    if (loaded.status === "unreadable" || loaded.status === "unavailable") {
      toast.warning(LOAD_MESSAGES[loaded.status], { id: "cv-load" });
    }
  }, [loaded]);

  useEffect(() => {
    latestRef.current = present;
    if (present === savedRef.current) return;
    const timer = window.setTimeout(flush, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [present, flush]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [flush]);

  const updateCv = useCallback((updater: CvUpdater, options?: UpdateOptions) => {
    const now = performance.now();
    setState((current) => {
      const history = commit(current.history, updater(current.history.present), {
        key: options?.coalesceKey,
        now,
      });
      return history === current.history ? current : { ...current, history };
    });
  }, []);

  const step = useCallback((move: (history: History) => History) => {
    setState((current) => {
      const history = move(current.history);
      return history === current.history ? current : { history, revision: current.revision + 1 };
    });
  }, []);

  const replaceCv = useCallback(
    (cv: CvDocument) => {
      const now = performance.now();
      step((history) => commit(history, cv, { now }));
    },
    [step],
  );

  const undo = useCallback(() => step(undoHistory), [step]);
  const redo = useCallback(() => step(redoHistory), [step]);

  const value = useMemo(
    () => ({
      cv: present,
      updateCv,
      replaceCv,
      undo,
      redo,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      revision,
    }),
    [present, history, revision, updateCv, replaceCv, undo, redo],
  );

  return <CvContext.Provider value={value}>{children}</CvContext.Provider>;
}

export function useCv(): CvContextValue {
  const context = useContext(CvContext);
  if (!context) throw new Error("useCv must be used inside CvProvider");
  return context;
}
