"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { PreviewBar } from "@/components/preview/preview-bar";
import { usePagination } from "@/components/preview/use-pagination";
import { formatZoom, zoomIn, zoomOut, zoomScale, type ZoomState } from "@/components/preview/zoom";
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
  const [zoom, setZoom] = useState<ZoomState>("fit");
  const [currentPage, setCurrentPage] = useState(1);
  const currentPageRef = useRef(1);

  // Layout effects so the first paint already has the right scale and page heights.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    // The stage's content box: its width minus padding and any vertical scrollbar.
    const measure = () => {
      const style = getComputedStyle(stage);
      setStageWidth(stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    measure();
    return () => observer.disconnect();
  }, []);

  const pageWidth = PAGE_SIZE_PX[settings.pageSize].width;
  const fitScale = stageWidth > 0 ? Math.min(1, stageWidth / pageWidth) : 1;
  const scale = zoomScale(zoom, fitScale);
  const contentHeight = pageContentHeight(settings);
  const pageCount = slices.length;

  const syncCurrentPage = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const next = currentPageFromScroll(stage);
    currentPageRef.current = next;
    setCurrentPage(next);
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.addEventListener("scroll", syncCurrentPage, { passive: true });
    return () => stage.removeEventListener("scroll", syncCurrentPage);
  }, [syncCurrentPage]);

  // A zoom change keeps the current page at the top of the stage.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (stage) scrollToPage(stage, currentPageRef.current, "instant");
    syncCurrentPage();
  }, [scale, syncCurrentPage]);

  // Re-derive (and so clamp) the current page when the page count changes.
  useLayoutEffect(() => {
    syncCurrentPage();
  }, [pageCount, syncCurrentPage]);

  const goToPage = (page: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollToPage(stage, page, reduce ? "instant" : "smooth");
  };

  const nextZoomIn = zoomIn(zoom, fitScale);
  const nextZoomOut = zoomOut(zoom, fitScale);

  return (
    <aside
      aria-label="CV preview"
      className="relative flex w-[540px] shrink-0 flex-col overflow-hidden border-l bg-canvas 2xl:w-[680px]"
    >
      <PreviewBar
        zoomLabel={formatZoom(scale)}
        onZoomIn={nextZoomIn === null ? null : () => setZoom(nextZoomIn)}
        onZoomOut={nextZoomOut === null ? null : () => setZoom(nextZoomOut)}
        currentPage={currentPage}
        pageCount={pageCount}
        onPreviousPage={currentPage > 1 ? () => goToPage(currentPage - 1) : null}
        onNextPage={currentPage < pageCount ? () => goToPage(currentPage + 1) : null}
      />

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

      <div ref={stageRef} className="min-h-0 flex-1 overflow-auto px-6 py-6">
        {/* min-w-full + w-max with auto margins centres narrow pages without hiding the left edge of wide ones. */}
        <div className="flex w-max min-w-full flex-col gap-6">
          {slices.map((slice, index) => (
            <PageFrame
              key={index}
              settings={settings}
              scale={scale}
              pageWidth={pageWidth}
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
  pageWidth: number;
  contentHeight: number;
  oversized: boolean;
  label: string;
  children: ReactNode;
};

function PageFrame({ settings, scale, pageWidth, contentHeight, oversized, label, children }: PageFrameProps) {
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
    <div data-page-frame style={{ width: pageWidth * scale }} className="mx-auto flex flex-col items-center gap-2">
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

/** The last page whose top is above a third of the stage's height; the last page once scrolled to the bottom. */
function currentPageFromScroll(stage: HTMLElement) {
  const frames = stage.querySelectorAll<HTMLElement>("[data-page-frame]");
  if (frames.length === 0) return 1;
  const scrollable = stage.scrollHeight > stage.clientHeight + 1;
  if (scrollable && stage.scrollTop + stage.clientHeight >= stage.scrollHeight - 1) return frames.length;
  const line = stage.getBoundingClientRect().top + stage.clientHeight / 3;
  let current = 1;
  frames.forEach((frame, index) => {
    if (frame.getBoundingClientRect().top <= line) current = index + 1;
  });
  return current;
}

/** Scroll so the page's top sits at the stage's top padding. */
function scrollToPage(stage: HTMLElement, page: number, behavior: ScrollBehavior) {
  const frame = stage.querySelectorAll<HTMLElement>("[data-page-frame]")[page - 1];
  if (!frame) return;
  const padding = parseFloat(getComputedStyle(stage).paddingTop);
  const top = stage.scrollTop + frame.getBoundingClientRect().top - stage.getBoundingClientRect().top - padding;
  stage.scrollTo({ top, behavior });
}
