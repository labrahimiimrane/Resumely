"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePagination } from "@/components/preview/use-pagination";
import { CvPage } from "@/components/templates/cv-page";
import { TEMPLATES } from "@/components/templates";
import { buildPageView, fullSlice, PAGE_SIZE_PX } from "@/lib/cv/paginate";
import { buildCvView } from "@/lib/cv/render";
import { cvDocumentSchema } from "@/lib/validations/cv";
import type { CvDocument } from "@/types/cv";

declare global {
  interface Window {
    /** Set by the server PDF renderer before the page loads; absent in a normal browser visit. */
    __RESUMELY_PRINT__?: unknown;
  }
}

/** Renders the injected CV as print sheets for the server PDF renderer; renders nothing otherwise. */
export function PrintDocument() {
  const [cv, setCv] = useState<CvDocument | null>(null);

  useEffect(() => {
    const parsed = cvDocumentSchema.safeParse(window.__RESUMELY_PRINT__);
    // Reading a window global has to wait for mount; this runs once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (parsed.success) setCv(parsed.data);
  }, []);

  return cv ? <PrintPages cv={cv} /> : null;
}

function PrintPages({ cv }: { cv: CvDocument }) {
  const { settings } = cv;
  const view = useMemo(() => buildCvView(cv), [cv]);
  const Template = TEMPLATES[settings.template];
  const measureRef = useRef<HTMLDivElement>(null);
  const slices = usePagination(measureRef, view, settings);
  const [ready, setReady] = useState(false);
  const sheetHeight = PAGE_SIZE_PX[settings.pageSize].height;

  // Ready once fonts and images are loaded and pagination has had a frame to settle.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((image) => image.decode().catch(() => undefined)));
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div data-pdf-ready={ready ? "true" : undefined}>
      {/* Margin lives inside CvPage, so the sheet itself has none. */}
      <style>{`@page { size: ${settings.pageSize === "A4" ? "A4" : "letter"}; margin: 0; } html, body { margin: 0; background: #fff; }`}</style>

      <div aria-hidden="true" inert className="pointer-events-none invisible absolute top-0 left-0 h-0 overflow-hidden">
        <CvPage settings={settings} autoHeight>
          <div ref={measureRef}>
            {view.isEmpty ? null : (
              <Template view={buildPageView(view, fullSlice(view), "measure-")} settings={settings} />
            )}
          </div>
        </CvPage>
      </div>

      {slices.map((slice, index) => (
        <div
          key={index}
          style={{
            breakAfter: index < slices.length - 1 ? "page" : undefined,
            // A page that fits is exactly one sheet: pagination's sub-pixel fit tolerance would otherwise
            // spill a blank extra sheet. Only that tolerance, inside the bottom margin, is cut off.
            // An oversized page keeps its content height and flows onto the next sheet instead of clipping.
            ...(slice.oversized ? null : { height: sheetHeight, overflow: "hidden" }),
          }}
        >
          <CvPage settings={settings} autoHeight>
            {view.isEmpty ? (
              <p className="text-cv-muted">Start filling in your details to see your CV here.</p>
            ) : (
              <Template view={buildPageView(view, slice)} settings={settings} />
            )}
          </CvPage>
        </div>
      ))}
    </div>
  );
}
