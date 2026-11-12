import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PresentationSettings } from "@/types/cv";

const FONT_STACKS: Record<PresentationSettings["fontFamily"], string> = {
  geist: "var(--font-geist-sans), Arial, sans-serif",
  inter: "Inter, Arial, sans-serif",
  georgia: 'Georgia, "Times New Roman", serif',
  arial: "Arial, Helvetica, sans-serif",
};

type CvPageProps = {
  settings: PresentationSettings;
  /** Height follows the content (used by the hidden measurer) instead of one page. */
  autoHeight?: boolean;
  className?: string;
  children: ReactNode;
};

export function CvPage({ settings, autoHeight = false, className, children }: CvPageProps) {
  const variables = {
    "--cv-font": FONT_STACKS[settings.fontFamily],
    "--cv-font-size": `${settings.fontSize}pt`,
    "--cv-line-height": String(settings.lineHeight),
    "--cv-primary": settings.primaryColor,
    "--cv-text": settings.textColor,
    "--cv-section-gap": `${settings.sectionSpacing}pt`,
    "--cv-margin": `${settings.pageMargin}mm`,
  } as CSSProperties;

  return (
    <article
      data-template={settings.template}
      data-page-size={settings.pageSize}
      style={variables}
      className={cn(
        "bg-page p-[var(--cv-margin)] font-[family-name:var(--cv-font)] text-[length:var(--cv-font-size)] leading-[var(--cv-line-height)] text-[color:var(--cv-text)] select-text",
        settings.pageSize === "A4" ? "w-[210mm]" : "w-[8.5in]",
        // A page is at least one sheet tall and grows instead of clipping, so overflow is never hidden.
        !autoHeight && (settings.pageSize === "A4" ? "min-h-[297mm]" : "min-h-[11in]"),
        className,
      )}
    >
      {children}
    </article>
  );
}
