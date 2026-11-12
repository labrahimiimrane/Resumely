"use client";

import { useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { PreviewBar } from "@/components/preview/preview-bar";
import { usePagination } from "@/components/preview/use-pagination";
import { CvPage } from "@/components/templates/cv-page";
import { TEMPLATES } from "@/components/templates";
import { useCv } from "@/hooks/use-cv";
import { buildPageView, fullSlice, pageContentHeight, PAGE_SIZE_PX } from "@/lib/cv/paginate";
import { buildCvView } from "@/lib/cv/render";
import type { PresentationSettings } from "@/types/cv";

const WIDE_QUERY = "(min-width: 1280px)";

function subscribeWide(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function usePreviewVisible() {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false,
  );
}

export function PreviewPanel() {
  const { cv } = useCv();
  const { settings } = cv;
  const view = useMemo(() => buildCvView(cv), [cv]);
  const Template = TEMPLATES[settings.template];
  const measureRef = useRef<HTMLDivElement>(null);
  const slices = usePagination(measureRef, view, settings);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);

  // Layout effects so the first paint already has the right scale and page heights.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => setStageWidth(stage.clientWidth));
    observer.observe(stage);
    setStageWidth(stage.clientWidth);
    return () => observer.disconnect();
  }, []);

  const scale = stageWidth ? Math.min(1, stageWidth / PAGE_SIZE_PX[settings.pageSize].width) : 1;
  const contentHeight = pageContentHeight(settings);

  return (
    <aside
      aria-label="CV preview"
      className="relative flex w-[540px] shrink-0 flex-col overflow-hidden border-l bg-canvas 2xl:w-[680px]"
    >
      <PreviewBar />

      {/* Hidden full-length copy that pagination measures; never visible or reachable. */}
      <div aria-hidden="true" inert className="pointer-events-none invisible absolute top-0 left-0 h-0 overflow-hidden">
        <CvPage settings={settings} autoHeight>
          <div ref={measureRef}>
            {view.isEmpty ? null : (
              <Template view={buildPageView(view, fullSlice(view), "measure-")} settings={settings} />
            )}
          </div>
        </CvPage>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div ref={stageRef} className="flex w-full flex-col gap-6">
          {slices.map((slice, index) => (
            <PageFrame
              key={index}
              settings={settings}
              scale={scale}
              contentHeight={contentHeight}
              oversized={slice.oversized}
              label={`Page ${index + 1} of ${slices.length}`}
            >
              {view.isEmpty ? (
                <p className="text-cv-muted">Start filling in your details to see your CV here.</p>
              ) : (
                <Template view={buildPageView(view, slice)} settings={settings} />
              )}
            </PageFrame>
          ))}
        </div>
      </div>
    </aside>
  );
}

type PageFrameProps = {
  settings: PresentationSettings;
  scale: number;
  contentHeight: number;
  oversized: boolean;
  label: string;
  children: ReactNode;
};

function PageFrame({ settings, scale, contentHeight, oversized, label, children }: PageFrameProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    const page = pageRef.current;
    const article = page?.querySelector("article");
    if (!page || !article) return;
    const measure = () => {
      setHeight(page.offsetHeight);
      // offsetHeight ignores the scale transform, so this compares true page px.
      const content = article.firstElementChild;
      setOverflowing(content instanceof HTMLElement && content.offsetHeight > contentHeight + 1);
    };
    // The article is at least one page tall, so it only resizes when content overflows or the size changes.
    const observer = new ResizeObserver(measure);
    observer.observe(article);
    measure();
    return () => observer.disconnect();
  }, [contentHeight]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ height: height * scale || undefined }} className="relative w-full">
        <div
          ref={pageRef}
          style={{ transform: `scale(${scale})` }}
          className="absolute top-0 left-0 w-max origin-top-left shadow-lift"
        >
          <CvPage settings={settings}>{children}</CvPage>
        </div>
      </div>
      <p className="font-mono text-xs text-faint">{label}</p>
      {oversized || overflowing ? (
        <p className="text-center text-xs text-warning">
          This page&apos;s content is taller than one page. Shorten it to keep whole pages.
        </p>
      ) : null}
    </div>
  );
}
