"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { isWholeSection, pageContentHeight, paginate, slicesEqual, type Block, type PageSlice } from "@/lib/cv/paginate";
import type { CvView } from "@/lib/cv/render";
import type { PresentationSettings } from "@/types/cv";

function readBlocks(root: HTMLElement, view: CvView): Block[] {
  const origin = root.getBoundingClientRect().top;
  const span = (element: Element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top - origin, bottom: rect.bottom - origin };
  };

  const blocks: Block[] = [];
  const header = root.querySelector("[data-cv-header]");
  if (header) blocks.push({ kind: "header", ...span(header) });

  for (const section of view.sections) {
    const element = root.querySelector(`[data-cv-section="${CSS.escape(section.key)}"]`);
    if (!element) continue;
    if (isWholeSection(section)) {
      blocks.push({ kind: "section", sectionKey: section.key, ...span(element) });
      continue;
    }
    const heading = element.querySelector("[data-cv-heading]");
    if (heading) blocks.push({ kind: "heading", sectionKey: section.key, ...span(heading) });
    element.querySelectorAll("[data-cv-item]").forEach((item) => {
      blocks.push({ kind: "item", sectionKey: section.key, itemIndex: Number(item.getAttribute("data-cv-item")), ...span(item) });
    });
  }
  return blocks;
}

const SINGLE_PAGE: PageSlice[] = [{ header: true, sections: [], oversized: false }];

/**
 * Measures the hidden full-CV render in `measureRef` and splits it into page slices.
 * Re-measures after every render, when the measurer resizes, and once web fonts are ready.
 */
export function usePagination(
  measureRef: RefObject<HTMLElement | null>,
  view: CvView,
  settings: PresentationSettings,
): PageSlice[] {
  const [slices, setSlices] = useState<PageSlice[]>(SINGLE_PAGE);
  const viewRef = useRef(view);
  const settingsRef = useRef(settings);

  const measure = useCallback(() => {
    const root = measureRef.current;
    const currentView = viewRef.current;
    const next =
      !root || currentView.isEmpty
        ? SINGLE_PAGE
        : paginate(readBlocks(root, currentView), pageContentHeight(settingsRef.current));
    // Only update when the result changes, so measuring after each render can't loop.
    setSlices((previous) => (slicesEqual(previous, next) ? previous : next));
  }, [measureRef]);

  useLayoutEffect(() => {
    viewRef.current = view;
    settingsRef.current = settings;
    measure();
  });

  useEffect(() => {
    const root = measureRef.current;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) measure();
    });
    if (!root) return () => void (cancelled = true);
    const observer = new ResizeObserver(() => measure());
    observer.observe(root);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [measureRef, measure]);

  return slices;
}
