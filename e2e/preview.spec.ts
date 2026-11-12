import { expect, test, type Page } from "@playwright/test";
import { cvPages, firstPage, loadExampleCv, openApp, preview } from "./helpers";

function pageReadout(page: Page) {
  return preview(page).getByRole("group", { name: "Page navigation" }).getByText(/^Page \d+ of \d+$/);
}

function zoomReadout(page: Page) {
  return preview(page).getByRole("group", { name: "Zoom" }).getByText(/^\d+%$/);
}

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test("an empty CV shows one page with a prompt", async ({ page }) => {
  await expect(cvPages(page)).toHaveCount(1);
  await expect(cvPages(page).getByText("Start filling in your details to see your CV here.")).toBeVisible();
  await expect(pageReadout(page)).toHaveText("Page 1 of 1");
});

test("the example CV paginates and page navigation moves between pages", async ({ page }) => {
  await loadExampleCv(page);
  const frames = cvPages(page);
  await expect(frames).not.toHaveCount(1);
  const total = await frames.count();
  expect(total).toBeGreaterThan(1);

  const previous = preview(page).getByRole("button", { name: "Previous page" });
  const next = preview(page).getByRole("button", { name: "Next page" });
  await expect(pageReadout(page)).toHaveText(`Page 1 of ${total}`);
  await expect(previous).toBeDisabled();

  await next.click();
  await expect(pageReadout(page)).toHaveText(`Page 2 of ${total}`);
  await expect(previous).toBeEnabled();

  await previous.click();
  await expect(pageReadout(page)).toHaveText(`Page 1 of ${total}`);
});

test("A4 and Letter switch the page size", async ({ page }) => {
  await loadExampleCv(page);
  const sizes = preview(page).getByRole("group", { name: "Page size" });
  await expect(firstPage(page)).toHaveAttribute("data-page-size", "A4");

  await sizes.getByText("Letter", { exact: true }).click();
  await expect(sizes.getByRole("radio", { name: "Letter" })).toBeChecked();
  await expect(firstPage(page)).toHaveAttribute("data-page-size", "Letter");

  await sizes.getByText("A4", { exact: true }).click();
  await expect(firstPage(page)).toHaveAttribute("data-page-size", "A4");
});

test("zoom steps in and out and stops at its limits", async ({ page }) => {
  await loadExampleCv(page);
  const zoomIn = preview(page).getByRole("button", { name: "Zoom in" });
  const zoomOut = preview(page).getByRole("button", { name: "Zoom out" });
  const readout = zoomReadout(page);
  const start = await readout.textContent();

  await zoomIn.click();
  await expect(readout).not.toHaveText(start!);

  while (await zoomIn.isEnabled()) await zoomIn.click();
  await expect(readout).toHaveText("150%");
  await expect(zoomIn).toBeDisabled();

  while (await zoomOut.isEnabled()) await zoomOut.click();
  await expect(readout).toHaveText("50%");
  await expect(zoomOut).toBeDisabled();
});
