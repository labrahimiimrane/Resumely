import type { CvView, ViewSection } from "@/lib/cv/render";
import type { PresentationSettings, SectionKey } from "@/types/cv";

// CSS px are 96 per inch, so these match the browser's (and Chromium's PDF) page geometry.
const PX_PER_MM = 96 / 25.4;

export const PAGE_SIZE_PX: Record<PresentationSettings["pageSize"], { width: number; height: number }> = {
  A4: { width: 210 * PX_PER_MM, height: 297 * PX_PER_MM },
  Letter: { width: 8.5 * 96, height: 11 * 96 },
};

const FIT_TOLERANCE_PX = 0.5;

export function pageContentHeight(settings: Pick<PresentationSettings, "pageSize" | "pageMargin">): number {
  return PAGE_SIZE_PX[settings.pageSize].height - 2 * settings.pageMargin * PX_PER_MM;
}

export function sectionHeadingId(key: SectionKey, idPrefix = ""): string {
  return `${idPrefix}cv-${key.replace(/[^a-z0-9]+/gi, "-")}`;
}

export type PageSection = ViewSection & { headingId: string; continued: boolean };

export type PageView = {
  header: CvView["header"] | null;
  photo: string | null;
  sections: PageSection[];
};

export type Block = {
  kind: "header" | "heading" | "item" | "section";
  sectionKey?: SectionKey;
  itemIndex?: number;
  top: number;
  bottom: number;
};

export type PageSlice = {
  header: boolean;
  sections: { key: SectionKey; from: number; to: number; continued: boolean }[];
  oversized: boolean;
};

// Summary, custom, and languages sections are measured and placed as one block.
export function isWholeSection(section: ViewSection): boolean {
  return section.type === "summary" || section.type === "custom" || section.type === "languages";
}

function itemCount(section: ViewSection): number {
  switch (section.type) {
    case "skills":
      return section.groups.length;
    case "experience":
    case "education":
    case "projects":
    case "certifications":
      return section.items.length;
    default:
      return 1;
  }
}

function sliceSection(section: ViewSection, from: number, to: number): ViewSection {
  switch (section.type) {
    case "skills":
      return { ...section, groups: section.groups.slice(from, to) };
    case "experience":
      return { ...section, items: section.items.slice(from, to) };
    case "education":
      return { ...section, items: section.items.slice(from, to) };
    case "projects":
      return { ...section, items: section.items.slice(from, to) };
    case "certifications":
      return { ...section, items: section.items.slice(from, to) };
    default:
      return section;
  }
}

/** One page holding the whole CV: used by the measurer and as the fallback before measuring. */
export function fullSlice(view: CvView): PageSlice {
  return {
    header: true,
    sections: view.sections.map((section) => ({ key: section.key, from: 0, to: itemCount(section), continued: false })),
    oversized: false,
  };
}

export function buildPageView(view: CvView, slice: PageSlice, idPrefix = ""): PageView {
  const byKey = new Map(view.sections.map((section) => [section.key, section]));
  const sections = slice.sections.flatMap(({ key, from, to, continued }) => {
    const section = byKey.get(key);
    if (!section) return [];
    return [{ ...sliceSection(section, from, to), headingId: sectionHeadingId(key, idPrefix), continued }];
  });
  return {
    header: slice.header ? view.header : null,
    photo: slice.header ? view.photo : null,
    sections,
  };
}

type Unit = { blocks: Block[]; top: number; bottom: number };

function toUnits(blocks: Block[]): Unit[] {
  const units: Unit[] = [];
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];
    const next = blocks[index + 1];
    // Glue a section heading to its section's first item so a heading never ends a page.
    if (block.kind === "heading" && next && next.kind === "item" && next.sectionKey === block.sectionKey) {
      units.push({
        blocks: [block, next],
        top: Math.min(block.top, next.top),
        bottom: Math.max(block.bottom, next.bottom),
      });
      index++;
    } else {
      units.push({ blocks: [block], top: block.top, bottom: block.bottom });
    }
  }
  return units;
}

function toSlice(units: Unit[], oversized: boolean): PageSlice {
  const slice: PageSlice = { header: false, sections: [], oversized };
  for (const { blocks } of units) {
    for (const block of blocks) {
      if (block.kind === "header") {
        slice.header = true;
        continue;
      }
      if (!block.sectionKey) continue;
      const last = slice.sections.at(-1);
      if (block.kind === "section") {
        slice.sections.push({ key: block.sectionKey, from: 0, to: 1, continued: false });
      } else if (block.kind === "item" && block.itemIndex !== undefined) {
        if (last && last.key === block.sectionKey) {
          last.to = block.itemIndex + 1;
        } else {
          slice.sections.push({
            key: block.sectionKey,
            from: block.itemIndex,
            to: block.itemIndex + 1,
            continued: block.itemIndex > 0,
          });
        }
      }
    }
  }
  return slice;
}

/** Greedily places measured blocks (in DOM order) into pages of `contentHeight` px. */
export function paginate(blocks: Block[], contentHeight: number): PageSlice[] {
  const pages: PageSlice[] = [];
  let current: Unit[] = [];
  let top = 0;
  let bottom = 0;

  for (const unit of toUnits(blocks)) {
    const span = Math.max(bottom, unit.bottom) - top;
    if (current.length > 0 && span <= contentHeight + FIT_TOLERANCE_PX) {
      current.push(unit);
      bottom = Math.max(bottom, unit.bottom);
      continue;
    }
    if (current.length > 0) pages.push(toSlice(current, false));
    if (unit.bottom - unit.top > contentHeight + FIT_TOLERANCE_PX) {
      // Taller than a whole page: give it its own page and flag it rather than clipping it.
      pages.push(toSlice([unit], true));
      current = [];
    } else {
      current = [unit];
      top = unit.top;
      bottom = unit.bottom;
    }
  }
  if (current.length > 0) pages.push(toSlice(current, false));
  return pages.length > 0 ? pages : [{ header: true, sections: [], oversized: false }];
}

export function slicesEqual(a: PageSlice[], b: PageSlice[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
