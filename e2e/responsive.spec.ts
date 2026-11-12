import { expect, test, type Page } from "@playwright/test";
import { cvPages, field, loadExampleCv, openApp, openSection, preview, undoShortcut } from "./helpers";

const SECTIONS = [
  "Personal information",
  "Professional summary",
  "Experience",
  "Education",
  "Skills",
  "Projects",
  "Certifications",
  "Languages",
  "Custom sections",
  "ATS analysis",
];

/** True when the page scrolls sideways. Sonner's toast list is wider than the viewport by design. */
function scrollsSideways(page: Page) {
  return page.evaluate(() => {
    const toaster = document.querySelector<HTMLElement>("[data-sonner-toaster]");
    const previous = toaster?.style.display;
    if (toaster) toaster.style.display = "none";
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    if (toaster) toaster.style.display = previous ?? "";
    return overflow;
  });
}

function workspaceTabs(page: Page) {
  return page.getByRole("tablist", { name: "Workspace view" });
}

/** One-step undo check that works at every tier: edits two fields, undoes once. */
async function expectSingleStepUndo(page: Page) {
  await field(page, "Full name").fill("Ada Lovelace");
  await field(page, "Email").fill("ada@example.com");
  await undoShortcut(page);
  await expect(field(page, "Email")).toHaveValue("");
  await expect(field(page, "Full name")).toHaveValue("Ada Lovelace");
}

test.describe("phone (390px)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("uses the slim header, tabs, and bottom bar", async ({ page }) => {
    await openApp(page);
    const header = page.getByRole("banner");
    await expect(header.getByRole("button", { name: "CV data" })).toBeVisible();
    await expect(header.getByRole("button", { name: "Download PDF" })).toHaveCount(0);
    await expect(header.getByRole("button", { name: "Undo" })).toHaveCount(0);
    await expect(workspaceTabs(page)).toBeVisible();
    await expect(preview(page)).toHaveCount(0);

    // One instance of each moved control, now in the bottom bar.
    await expect(page.getByRole("button", { name: "Undo" })).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Download PDF" })).toHaveCount(1);

    await page.getByRole("tab", { name: "Preview" }).click();
    await expect(cvPages(page).first()).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Template" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Customize" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Undo" })).toHaveCount(0);

    await page.getByRole("button", { name: "Customize" }).click();
    await expect(page.getByRole("tab", { name: "Edit" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { name: "Customize", level: 1 })).toBeVisible();
  });

  test("nothing scrolls sideways in any view", async ({ page }) => {
    await openApp(page);
    await loadExampleCv(page);
    for (const section of SECTIONS) {
      await openSection(page, section);
      await expect(page.getByRole("heading", { name: section, level: 1 })).toBeVisible();
      expect(await scrollsSideways(page), `${section} scrolls sideways`).toBe(false);
    }
    await page.getByRole("tab", { name: "Preview" }).click();
    await page.getByRole("button", { name: "Customize" }).click();
    await expect(page.getByRole("heading", { name: "Customize", level: 1 })).toBeVisible();
    expect(await scrollsSideways(page), "Customize scrolls sideways").toBe(false);

    await page.getByRole("tab", { name: "Preview" }).click();
    await expect(cvPages(page).first()).toBeVisible();
    expect(await scrollsSideways(page), "Preview scrolls sideways").toBe(false);
  });

  test("undo steps once and in-progress values survive a tab switch", async ({ page }) => {
    await openApp(page);
    await expectSingleStepUndo(page);

    const email = field(page, "Email");
    await email.fill("half@typ");
    await page.getByRole("tab", { name: "Preview" }).click();
    await expect(cvPages(page).first()).toBeVisible();
    await page.getByRole("tab", { name: "Edit" }).click();
    await expect(email).toHaveValue("half@typ");
  });
});

test.describe("tablet (1024px)", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("shows the full header with Edit and Preview tabs", async ({ page }) => {
    await openApp(page);
    const header = page.getByRole("banner");
    await expect(header.getByRole("button", { name: "Undo" })).toBeVisible();
    await expect(header.getByRole("button", { name: "Download PDF" })).toBeVisible();
    await expect(header.getByRole("combobox", { name: "Template" })).toBeVisible();
    await expect(workspaceTabs(page)).toBeVisible();

    const previewTab = page.getByRole("tab", { name: "Preview" });
    await page.getByRole("tab", { name: "Edit" }).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(previewTab).toHaveAttribute("aria-selected", "true");
    await expect(cvPages(page).first()).toBeVisible();
    expect(await scrollsSideways(page)).toBe(false);
  });

  test("undo steps once", async ({ page }) => {
    await openApp(page);
    await expectSingleStepUndo(page);
  });
});

test.describe("desktop (1440px)", () => {
  test("shows the three-panel layout without tabs", async ({ page }) => {
    await openApp(page);
    await expect(workspaceTabs(page)).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "CV sections" })).toBeVisible();
    await expect(preview(page)).toBeVisible();
    expect(await scrollsSideways(page)).toBe(false);
    await expectSingleStepUndo(page);
  });
});
