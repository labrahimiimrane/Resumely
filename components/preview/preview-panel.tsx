"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CvPage } from "@/components/templates/cv-page";
import { TEMPLATES } from "@/components/templates";
import { useCv } from "@/hooks/use-cv";
import { buildCvView } from "@/lib/cv/render";

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
  const view = useMemo(() => buildCvView(cv), [cv]);
  const Template = TEMPLATES[cv.settings.template];
  const frameRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, height: 0 });

  useEffect(() => {
    const frame = frameRef.current;
    const page = pageRef.current;
    if (!frame || !page) return;
    const measure = () => {
      const pageWidth = page.offsetWidth;
      if (!pageWidth) return;
      const scale = Math.min(1, frame.clientWidth / pageWidth);
      setFit({ scale, height: page.offsetHeight * scale });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(page);
    measure();
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      aria-label="CV preview"
      className="flex w-[540px] shrink-0 flex-col overflow-y-auto border-l bg-canvas px-6 py-6 2xl:w-[680px]"
    >
      <div ref={frameRef} className="w-full">
        <div style={{ height: fit.height || undefined }} className="relative w-full">
          <div
            ref={pageRef}
            style={{ transform: `scale(${fit.scale})` }}
            className="absolute top-0 left-0 w-max origin-top-left shadow-lift"
          >
            <CvPage settings={cv.settings}>
              {view.isEmpty ? (
                <p className="text-cv-muted">Start filling in your details to see your CV here.</p>
              ) : (
                <Template view={view} settings={cv.settings} />
              )}
            </CvPage>
          </div>
        </div>
      </div>
    </aside>
  );
}
