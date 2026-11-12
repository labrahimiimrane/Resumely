"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Wide tier (Tailwind `xl`): three-panel layout with the preview beside the editor. */
export const WIDE_QUERY = "(min-width: 1280px)";
/** Narrow tier (below Tailwind `sm`): slim header and bottom action bar. */
export const NARROW_QUERY = "(max-width: 639.98px)";

/**
 * Whether a media query matches. The server snapshot is false, but the workspace mounts only
 * after CvProvider hydrates, so its first client render already reads the real viewport.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
