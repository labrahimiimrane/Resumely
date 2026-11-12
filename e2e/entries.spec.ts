import { expect, test, type Page } from "@playwright/test";
import { cvPages, keyboardReorder, loadExampleCv, openApp, openSection, preview } from "./helpers";

const SENIOR = "Senior Frontend Engineer, Northwind Analytics";
const JUNIOR = "Frontend Engineer, Contoso Retail";

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await loadExampleCv(page);
  await openSection(page, "Experience");
});

/** Entry headings (level 3) across every preview page, in order. Long sections continue onto page 2. */
function experienceHeadings(page: Page) {
  return preview(page).getByRole("heading", { level: 3, name: /Frontend Engineer( \(copy\))?$/ });
}

test("duplicating an entry adds a marked copy below it in the editor and the preview", async ({ page }) => {
  await page.getByRole("button", { name: `Duplicate ${SENIOR}` }).click();

  await expect(page.getByRole("main").getByRole("article")).toHaveCount(3);
  await expect(experienceHeadings(page)).toHaveText([
    "Senior Frontend Engineer",
    "Senior Frontend Engineer (copy)",
    "Frontend Engineer",
  ]);
});

test("hiding an entry removes it from the preview but keeps it in the editor", async ({ page }) => {
  const toggle = page.getByRole("switch", { name: `Show ${JUNIOR} on CV` });
  await toggle.click();

  await expect(toggle).not.toBeChecked();
  await expect(page.getByRole("button", { name: `Duplicate ${JUNIOR}` })).toBeVisible();
  await expect(experienceHeadings(page)).toHaveText(["Senior Frontend Engineer"]);
  await expect(cvPages(page).getByText("Contoso Retail")).toHaveCount(0);

  await toggle.click();
  await expect(experienceHeadings(page)).toHaveText(["Senior Frontend Engineer", "Frontend Engineer"]);
});

test("entries reorder with the keyboard", async ({ page }) => {
  await keyboardReorder(page, `Reorder ${JUNIOR}`, "ArrowUp");

  await expect(experienceHeadings(page)).toHaveText(["Frontend Engineer", "Senior Frontend Engineer"]);
  await expect(page.getByRole("main").getByRole("article").first()).toContainText("Contoso Retail");
});

test("hiding a whole section removes it from the preview", async ({ page }) => {
  await page.getByRole("switch", { name: "Show Experience on CV" }).click();

  await expect(preview(page).getByRole("heading", { name: "Work Experience" })).toHaveCount(0);
  await expect(page.getByRole("main").getByRole("article")).toHaveCount(2);

  await page.getByRole("switch", { name: "Show Experience on CV" }).click();
  await expect(preview(page).getByRole("heading", { name: "Work Experience" })).toBeVisible();
});
