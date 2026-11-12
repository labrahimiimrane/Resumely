"use client";

import type { ComponentProps, CSSProperties } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { NARROW_QUERY, useMediaQuery } from "@/hooks/use-media-query";

type ToasterProps = ComponentProps<typeof Sonner>;

export function Toaster(props: ToasterProps) {
  const { theme = "system" } = useTheme();
  // Narrow screens have a bottom action bar (64px + border); keep toasts above it. Sides stay at
  // Sonner's defaults (24px desktop, 16px mobile): an object offset drops any side it omits.
  const narrow = useMediaQuery(NARROW_QUERY);
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      offset={narrow ? { bottom: 80, left: 24, right: 24 } : undefined}
      mobileOffset={narrow ? { bottom: 80, left: 16, right: 16 } : undefined}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as CSSProperties
      }
      {...props}
    />
  );
}
