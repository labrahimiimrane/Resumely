import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import {
  CV_BACKUP_KEY,
  CV_STORAGE_KEY,
  EXAMPLE_CV_NAME,
  confirmDialog,
  field,
  loadExampleCv,
  openApp,
  readStorage,
  storedFullName,
} from "./helpers";

function toast(page: Page, text: string | RegExp) {
  return page.locator("[data-sonner-toast]").filter({ hasText: text });
}

async function openDataMenu(page: Page, item: string) {
  await page.getByRole("button", { name: "CV data" }).click();
  await page.getByRole("menuitem", { name: item }).click();
}

/** Picks a file through the Import JSON menu item, the way a user does. */
async function importFile(page: Page, name: string, contents: string) {
  const chooser = page.waitForEvent("filechooser");
  await openDataMenu(page, "Import JSON…");
  await (await chooser).setFiles({ name, mimeType: "application/json", buffer: Buffer.from(contents) });
}

async function exportCv(page: Page) {
  const download = page.waitForEvent("download");
  await openDataMenu(page, "Export JSON");
  return download;
}

test.describe("autosave and recovery", () => {
  test("edits persist across a reload", async ({ page }) => {
    await openApp(page);
    await field(page, "Full name").fill("Ada Lovelace");
    await expect.poll(() => storedFullName(page)).toBe("Ada Lovelace");

    await page.reload();
    await expect(field(page, "Full name")).toHaveValue("Ada Lovelace");
  });

  test("a corrupted saved CV starts a new CV and keeps the unreadable copy", async ({ page }) => {
    await page.addInitScript((key) => window.localStorage.setItem(key, "{not json"), CV_STORAGE_KEY);
    await openApp(page);

    await expect(toast(page, "Your saved CV couldn't be read, so a new CV was started.")).toBeVisible();
    await expect(field(page, "Full name")).toHaveValue("");
    expect(await readStorage(page, CV_BACKUP_KEY)).toBe("{not json");
  });
});

test.describe("JSON import and export", () => {
  test("an exported file imports back to the same CV and the import can be undone", async ({ page }) => {
    await openApp(page);
    await loadExampleCv(page);
    const download = await exportCv(page);
    expect(download.suggestedFilename()).toBe("example-cv-alex-morgan.json");
    await expect(toast(page, "CV exported")).toBeVisible();
    const exported = await readFile((await download.path())!, "utf8");
    const parsed = JSON.parse(exported) as { version: number; personal: { fullName: string } };
    expect(parsed.version).toEqual(expect.any(Number));
    expect(parsed.personal.fullName).toBe("Alex Morgan");

    // Change the CV, then bring the export back.
    await field(page, "Full name").fill("Someone Else");
    await importFile(page, "cv.json", exported);
    await expect(page.getByRole("alertdialog")).toContainText(EXAMPLE_CV_NAME);
    await confirmDialog(page, "Replace CV");
    await expect(toast(page, "CV imported")).toBeVisible();
    await expect(field(page, "Full name")).toHaveValue("Alex Morgan");
    await expect.poll(() => readStorage(page, CV_STORAGE_KEY)).toEqual(JSON.parse(exported));

    await page.getByRole("button", { name: "Undo" }).click();
    await expect(field(page, "Full name")).toHaveValue("Someone Else");
  });

  const invalidFiles = [
    { name: "invalid JSON", contents: "{oops", message: "That file isn't valid JSON." },
    {
      name: "an unsupported version",
      contents: JSON.stringify({ version: 999 }),
      message: "That file uses an unsupported CV format version.",
    },
    { name: "a non-CV object", contents: JSON.stringify({ hello: "world" }), message: "That file isn't a valid Resumely CV." },
  ];

  for (const file of invalidFiles) {
    test(`importing ${file.name} shows an error and keeps the CV`, async ({ page }) => {
      await openApp(page);
      await field(page, "Full name").fill("Ada Lovelace");
      await importFile(page, "bad.json", file.contents);

      await expect(toast(page, file.message)).toBeVisible();
      await expect(page.getByRole("alertdialog")).toHaveCount(0);
      await expect(field(page, "Full name")).toHaveValue("Ada Lovelace");
    });
  }
});

test.describe("example CV and clearing data", () => {
  test("loading the example on an empty CV needs no confirmation", async ({ page }) => {
    await openApp(page);
    await loadExampleCv(page);
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    await expect(toast(page, "Example CV loaded")).toBeVisible();
  });

  test("loading the example over a CV asks first, and Cancel keeps the CV", async ({ page }) => {
    await openApp(page);
    await field(page, "Full name").fill("Ada Lovelace");
    await openDataMenu(page, "Load example CV");
    await confirmDialog(page, "Cancel");
    await expect(field(page, "Full name")).toHaveValue("Ada Lovelace");

    await openDataMenu(page, "Load example CV");
    await confirmDialog(page, "Load example");
    await expect(field(page, "Full name")).toHaveValue("Alex Morgan");
  });

  test("clearing stored data asks first, then empties the CV and storage", async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => {
        if (window.sessionStorage.getItem("seeded")) return;
        window.sessionStorage.setItem("seeded", "1");
        window.localStorage.setItem(key, value);
      },
      [CV_BACKUP_KEY, "{old unreadable copy"] as const,
    );
    await openApp(page);
    await loadExampleCv(page);
    await expect.poll(() => storedFullName(page)).toBe("Alex Morgan");

    await openDataMenu(page, "Clear stored data");
    await confirmDialog(page, "Clear data");
    await expect(toast(page, "Stored data cleared")).toBeVisible();
    await expect(field(page, "Full name")).toHaveValue("");
    await expect(page.getByRole("banner").getByText("Untitled CV")).toBeVisible();
    expect(await readStorage(page, CV_BACKUP_KEY)).toBeNull();
    // The new empty CV may be autosaved again, but the previous CV is gone.
    expect(await storedFullName(page)).not.toBe("Alex Morgan");
  });
});
