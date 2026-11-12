import { expect, test, type Locator, type Page } from "@playwright/test";
import { firstPage, keyboardReorder, loadExampleCv, openApp, previewSectionHeadings } from "./helpers";

/** Reads one of the CV page's custom properties (set inline from the presentation settings). */
function cssVariable(page: Page, name: string) {
  return firstPage(page).evaluate((article, variable) => (article as HTMLElement).style.getPropertyValue(variable), name);
}

function customize(page: Page): Locator {
  return page.getByRole("region", { name: "Customize" });
}

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await loadExampleCv(page);
  await page.getByRole("button", { name: "Customize" }).click();
  await expect(customize(page).getByRole("heading", { name: "Customize", level: 1 })).toBeVisible();
});

test("typography, color, margin, and page settings reach the preview", async ({ page }) => {
  const panel = customize(page);

  await panel.getByRole("combobox", { name: "Font family" }).selectOption({ label: "Georgia" });
  await expect.poll(() => cssVariable(page, "--cv-font")).toContain("Georgia");

  const fontSizeBefore = await cssVariable(page, "--cv-font-size");
  await panel.getByRole("slider", { name: "Font size" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => cssVariable(page, "--cv-font-size")).not.toBe(fontSizeBefore);

  // The native radio and its name are visually hidden behind the swatch, so check the radio directly.
  await panel.getByRole("group", { name: "Primary color" }).getByRole("radio", { name: "Teal" }).check({ force: true });
  await expect.poll(() => cssVariable(page, "--cv-primary")).toBe("#1f6f8b");

  await panel.getByRole("slider", { name: "Margins" }).focus();
  await page.keyboard.press("End");
  await expect.poll(() => cssVariable(page, "--cv-margin")).toBe("30mm");

  await panel.getByRole("group", { name: "Page size" }).getByText("Letter", { exact: true }).click();
  await expect(firstPage(page)).toHaveAttribute("data-page-size", "Letter");
});

test("section order moves sections in the preview and hides them", async ({ page }) => {
  const before = await previewSectionHeadings(page);
  expect(before.indexOf("Skills")).toBeGreaterThan(before.indexOf("Work Experience"));

  // Skills sits below Summary, Experience, and Education; two steps up puts it above Experience.
  await keyboardReorder(page, "Reorder Skills", "ArrowUp", 2);
  await expect
    .poll(async () => {
      const headings = await previewSectionHeadings(page);
      return headings.indexOf("Skills") < headings.indexOf("Work Experience");
    })
    .toBe(true);

  await customize(page).getByRole("switch", { name: "Show Projects on CV" }).click();
  await expect.poll(() => previewSectionHeadings(page)).not.toContain("Projects");
});
