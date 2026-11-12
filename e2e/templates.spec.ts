import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { firstPage, loadExampleCv, openApp, preview } from "./helpers";

const TEMPLATES = [
  { id: "professional", label: "Professional", photo: false },
  { id: "modern", label: "Modern", photo: true },
  { id: "executive", label: "Executive", photo: true },
  { id: "developer", label: "Developer", photo: false },
  { id: "minimal", label: "Minimal", photo: false },
  { id: "compact", label: "Compact", photo: false },
] as const;

async function selectTemplate(page: Page, label: string) {
  await page.getByRole("banner").getByRole("combobox", { name: "Template" }).selectOption({ label });
}

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await loadExampleCv(page);
});

for (const template of TEMPLATES) {
  test(`${template.label} template renders the CV with standard headings`, async ({ page }) => {
    await selectTemplate(page, template.label);

    await expect(firstPage(page)).toHaveAttribute("data-template", template.id);
    const cv = preview(page);
    await expect(cv.getByRole("heading", { name: "Alex Morgan", level: 1 })).toBeVisible();
    for (const heading of [/Summary/i, /Experience/i, /Education/i, /Skills/i]) {
      await expect(cv.getByRole("heading", { name: heading, level: 2 }).first()).toBeVisible();
    }
  });
}

test("only the Modern and Executive templates show an uploaded photo", async ({ page }) => {
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Upload photo" }).click();
  await (await chooser).setFiles(path.join(__dirname, "fixtures", "photo.png"));
  await expect(page.getByRole("switch", { name: "Show photo on CV" })).toBeChecked();

  const photo = preview(page).getByRole("img", { name: "Photo of Alex Morgan" });
  for (const template of TEMPLATES) {
    await selectTemplate(page, template.label);
    await expect(firstPage(page)).toHaveAttribute("data-template", template.id);
    if (template.photo) await expect(photo).toBeVisible();
    else await expect(photo).toHaveCount(0);
  }
});
