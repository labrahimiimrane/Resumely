"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { createEmptyCv } from "@/lib/cv/document";
import type { CvDocument } from "@/types/cv";

type CvUpdater = (current: CvDocument) => CvDocument;

type CvContextValue = {
  cv: CvDocument;
  updateCv: (updater: CvUpdater) => void;
};

const CvContext = createContext<CvContextValue | null>(null);

export function CvProvider({ children }: { children: ReactNode }) {
  const [cv, setCv] = useState<CvDocument>(createEmptyCv);
  const updateCv = useCallback((updater: CvUpdater) => setCv(updater), []);
  const value = useMemo(() => ({ cv, updateCv }), [cv, updateCv]);

  return <CvContext.Provider value={value}>{children}</CvContext.Provider>;
}

export function useCv(): CvContextValue {
  const context = useContext(CvContext);
  if (!context) throw new Error("useCv must be used inside CvProvider");
  return context;
}
