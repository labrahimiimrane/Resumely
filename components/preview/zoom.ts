// Preview zoom: "fit" follows the stage width; a number is a fixed scale of the true page size.
export type ZoomState = "fit" | number;

export const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5] as const;

// A fit scale this close to a fixed level is treated as that level.
const SNAP = 0.02;

type Level = { scale: number; state: ZoomState };

function levels(fitScale: number): Level[] {
  const fixed: Level[] = ZOOM_LEVELS.map((scale) => ({ scale, state: scale }));
  if (fixed.some((level) => Math.abs(level.scale - fitScale) <= SNAP)) return fixed;
  return [...fixed, { scale: fitScale, state: "fit" as const }].sort((a, b) => a.scale - b.scale);
}

export function zoomScale(state: ZoomState, fitScale: number) {
  return state === "fit" ? fitScale : state;
}

/** The next state above the current scale, or null at the top level. */
export function zoomIn(state: ZoomState, fitScale: number): ZoomState | null {
  const current = zoomScale(state, fitScale);
  return levels(fitScale).find((level) => level.scale > current + SNAP)?.state ?? null;
}

/** The next state below the current scale, or null at the bottom level. */
export function zoomOut(state: ZoomState, fitScale: number): ZoomState | null {
  const current = zoomScale(state, fitScale);
  return levels(fitScale).findLast((level) => level.scale < current - SNAP)?.state ?? null;
}

export function formatZoom(scale: number) {
  return `${Math.round(scale * 100)}%`;
}
