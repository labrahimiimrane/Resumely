"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { ColorField, type Swatch } from "@/components/customize/color-field";
import { SectionOrder } from "@/components/customize/section-order";
import { SettingSlider } from "@/components/customize/setting-slider";
import { PageSizeToggle } from "@/components/preview/page-size-toggle";
import { Button } from "@/components/ui/button";
import { useCv } from "@/hooks/use-cv";
import { FONT_FAMILIES, SETTINGS_LIMITS } from "@/lib/validations/cv";
import type { PresentationSettings } from "@/types/cv";

type FontFamily = PresentationSettings["fontFamily"];

const FONT_LABELS: Record<FontFamily, string> = {
  geist: "Geist",
  inter: "Inter",
  georgia: "Georgia",
  arial: "Arial",
};

const PRIMARY_SWATCHES: readonly Swatch[] = [
  { name: "Indigo", value: "#2f3b8f" },
  { name: "Teal", value: "#1f6f8b" },
  { name: "Forest", value: "#2f6b45" },
  { name: "Burgundy", value: "#8a3a3a" },
  { name: "Charcoal", value: "#2b2b33" },
];

const TEXT_SWATCHES: readonly Swatch[] = [
  { name: "Ink", value: "#1d1d22" },
  { name: "Graphite", value: "#33363f" },
  { name: "Black", value: "#000000" },
];

type CustomizePanelProps = {
  onBack: () => void;
};

export function CustomizePanel({ onBack }: CustomizePanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fontId = useId();
  const { cv, updateCv } = useCv();
  const { settings } = cv;

  /** Writes one setting; a coalesce key groups a continuous drag into one undo step. */
  function set<K extends keyof PresentationSettings>(key: K, value: PresentationSettings[K], coalesce = false) {
    if (settings[key] === value) return;
    updateCv((doc) => ({ ...doc, settings: { ...doc.settings, [key]: value } }), {
      coalesceKey: coalesce ? `settings.${key}` : undefined,
    });
  }

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section aria-labelledby="customize-heading" className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2.5 text-muted-foreground">
          <ChevronLeft aria-hidden="true" />
          Back to editor
        </Button>
        <div>
          <h1
            id="customize-heading"
            ref={headingRef}
            tabIndex={-1}
            className="rounded-sm text-[22px] font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Customize
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Adjust typography, colors, page layout, and section order. Changes apply to the preview instantly.
          </p>
        </div>
      </div>

      <SettingsGroup title="Typography">
        <div className="flex flex-col gap-2">
          <label htmlFor={fontId} className="text-[13px] font-medium">
            Font family
          </label>
          <div className="relative flex h-9 items-center rounded-md border bg-card text-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <select
              id={fontId}
              value={settings.fontFamily}
              onChange={(event) => set("fontFamily", event.target.value as FontFamily)}
              className="h-full w-full cursor-pointer appearance-none bg-transparent pr-9 pl-3 outline-none dark:[color-scheme:dark]"
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font} value={font}>
                  {FONT_LABELS[font]}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3 size-4 text-muted-foreground"
            />
          </div>
        </div>
        <SettingSlider
          label="Font size"
          value={settings.fontSize}
          {...SETTINGS_LIMITS.fontSize}
          step={0.5}
          format={(value) => `${value} pt`}
          onChange={(value) => set("fontSize", value, true)}
        />
        <SettingSlider
          label="Line height"
          value={settings.lineHeight}
          {...SETTINGS_LIMITS.lineHeight}
          step={0.05}
          format={(value) => value.toFixed(2)}
          onChange={(value) => set("lineHeight", value, true)}
        />
      </SettingsGroup>

      <SettingsGroup title="Colors">
        <ColorField
          label="Primary color"
          value={settings.primaryColor}
          swatches={PRIMARY_SWATCHES}
          onChange={(value, typing) => set("primaryColor", value, typing)}
        />
        <ColorField
          label="Text color"
          value={settings.textColor}
          swatches={TEXT_SWATCHES}
          onChange={(value, typing) => set("textColor", value, typing)}
        />
      </SettingsGroup>

      <SettingsGroup title="Page">
        <PageSizeToggle showLegend />
        <SettingSlider
          label="Margins"
          value={settings.pageMargin}
          {...SETTINGS_LIMITS.pageMargin}
          step={1}
          format={(value) => `${value} mm`}
          onChange={(value) => set("pageMargin", value, true)}
        />
        <SettingSlider
          label="Section spacing"
          value={settings.sectionSpacing}
          {...SETTINGS_LIMITS.sectionSpacing}
          step={1}
          format={(value) => `${value} pt`}
          onChange={(value) => set("sectionSpacing", value, true)}
        />
      </SettingsGroup>

      <SettingsGroup title="Section order">
        <SectionOrder />
      </SettingsGroup>
    </section>
  );
}

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5 border-t pt-5">
      <h2 id={id} className="text-xs font-medium tracking-wider text-faint uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
