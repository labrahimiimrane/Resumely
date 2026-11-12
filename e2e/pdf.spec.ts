import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { loadExampleCv, openApp, preview } from "./helpers";

// A real Chromium render on the server; give it room beyond the default 30 s.
test.describe.configure({ timeout: 60_000 });

async function downloadPdf(page: Page) {
  // Hold the request briefly so the busy state is observable regardless of render speed.
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/api/pdf", async (route) => {
    await held;
    await route.continue();
  });

  const download = page.waitForEvent("download", { timeout: 45_000 });
  await page.getByRole("button", { name: "Download PDF" }).click();
  await expect(page.getByRole("button", { name: "Creating PDF…" })).toBeDisabled();
  release();

  const file = await download;
  await expect(page.locator("[data-sonner-toast]").filter({ hasText: "PDF downloaded" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download PDF" })).toBeEnabled();
  await page.unroute("**/api/pdf");
  return file;
}

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await loadExampleCv(page);
});

for (const size of ["A4", "Letter"] as const) {
  test(`Download PDF produces a ${size} PDF named after the CV`, async ({ page }) => {
    const sizes = preview(page).getByRole("group", { name: "Page size" });
    await sizes.getByText(size, { exact: true }).click();
    await expect(sizes.getByRole("radio", { name: size })).toBeChecked();

    const file = await downloadPdf(page);
    expect(file.suggestedFilename()).toBe("example-cv-alex-morgan.pdf");
    const bytes = await readFile((await file.path())!);
    expect(bytes.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });
}

test.describe("PDF route errors", () => {
  test("rejects a non-JSON content type with 415", async ({ request }) => {
    const response = await request.post("/api/pdf", { headers: { "Content-Type": "text/plain" }, data: "hello" });
    expect(response.status()).toBe(415);
    expect(await response.json()).toEqual({ error: "unsupported-media-type" });
  });

  test("rejects an invalid CV with 400", async ({ request }) => {
    const response = await request.post("/api/pdf", { data: { not: "a cv" } });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid-cv" });
  });

  test("rejects a body over 2 MiB with 413", async ({ request }) => {
    const oversized = JSON.stringify({ padding: "x".repeat(2 * 1024 * 1024 + 1) });
    const response = await request.post("/api/pdf", { headers: { "Content-Type": "application/json" }, data: oversized });
    expect(response.status()).toBe(413);
    expect(await response.json()).toEqual({ error: "too-large" });
  });
});
