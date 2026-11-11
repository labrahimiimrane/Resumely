"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { createEmptyCv } from "@/lib/cv/document";
import { commit, createHistory, redo as redoHistory, undo as undoHistory, type History } from "@/lib/cv/history";
import type { CvDocument } from "@/types/cv";

type CvUpdater = (current: CvDocument) => CvDocument;
type UpdateOptions = { coalesceKey?: string };

type CvContextValue = {
  cv: CvDocument;
  updateCv: (updater: CvUpdater, options?: UpdateOptions) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  revision: number;
};

type StoreState = { history: History; revision: number };

const CvContext = createContext<CvContextValue | null>(null);

export function CvProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(() => ({
    history: createHistory(createEmptyCv()),
    revision: 0,
  }));
  const { history, revision } = state;

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

  const undo = useCallback(() => step(undoHistory), [step]);
  const redo = useCallback(() => step(redoHistory), [step]);

  const value = useMemo(
    () => ({
      cv: history.present,
      updateCv,
      undo,
      redo,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      revision,
    }),
    [history, revision, updateCv, undo, redo],
  );

  return <CvContext.Provider value={value}>{children}</CvContext.Provider>;
}

export function useCv(): CvContextValue {
  const context = useContext(CvContext);
  if (!context) throw new Error("useCv must be used inside CvProvider");
  return context;
}
