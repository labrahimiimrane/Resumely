import { expect, type Locator, type Page } from "@playwright/test";

export const CV_STORAGE_KEY = "resumely:cv";
export const CV_BACKUP_KEY = "resumely:cv:unreadable";
export const EXAMPLE_CV_NAME = "Example CV - Alex Morgan";

/** Opens the editor and waits until the CV has loaded from storage. */
export async function openApp(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
}

/** Loads the example CV from the CV data menu. Expects an empty CV, so no confirmation dialog. */
export async function loadExampleCv(page: Page) {
  await page.getByRole("button", { name: "CV data" }).click();
  await page.getByRole("menuitem", { name: "Load example CV" }).click();
  await expect(page.getByRole("banner").getByText(EXAMPLE_CV_NAME)).toBeVisible();
}

/** Opens a content section (or "ATS analysis") from the section navigation. */
export async function openSection(page: Page, label: string) {
  await page
    .getByRole("navigation", { name: "CV sections" })
    .getByRole("button", { name: new RegExp(`^${label}`) })
    .click();
}

/** The live preview panel; its hidden measuring copy is excluded from role queries. */
export function preview(page: Page): Locator {
  return page.getByRole("complementary", { name: "CV preview" });
}

/** The visible CV page frames, excluding the hidden copy that pagination measures. Use for text queries. */
export function cvPages(page: Page): Locator {
  return preview(page).locator("[data-page-frame]");
}

/** A text field in the editor, found by its accessible name. */
export function field(page: Page, name: string): Locator {
  return page.getByRole("main").getByRole("textbox", { name, exact: true });
}

/** The first rendered CV page in the preview. */
export function firstPage(page: Page): Locator {
  return preview(page).locator("[data-page-frame] article").first();
}

/** Reads a stored value from LocalStorage, parsed as JSON when it is valid JSON. */
export async function readStorage(page: Page, key: string): Promise<unknown> {
  return page.evaluate((storageKey) => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return raw;
    }
  }, key);
}

/** The stored CV's full name, or null when nothing is stored. */
export async function storedFullName(page: Page): Promise<string | null> {
  const cv = (await readStorage(page, CV_STORAGE_KEY)) as { personal?: { fullName?: string } } | null;
  return cv?.personal?.fullName ?? null;
}

/** Moves focus off any field, so the global undo/redo shortcut is not blocked. */
async function blurActiveElement(page: Page) {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
}

export async function undoShortcut(page: Page) {
  await blurActiveElement(page);
  await page.keyboard.press("ControlOrMeta+z");
}

export async function redoShortcut(page: Page) {
  await blurActiveElement(page);
  await page.keyboard.press("ControlOrMeta+Shift+z");
}

/** Confirms the open alert dialog with the named action. */
export async function confirmDialog(page: Page, action: string) {
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: action }).click();
  await expect(dialog).toBeHidden();
}

/** Text of the CV section headings (level 2) across all preview pages, in order. */
export async function previewSectionHeadings(page: Page): Promise<string[]> {
  return preview(page).getByRole("heading", { level: 2 }).allTextContents();
}

/**
 * Moves a sortable item with dnd-kit's keyboard sensor: Space picks up, arrows move, Space drops.
 * Each key waits for dnd-kit's live announcement so the sensor has measured before the next key.
 */
export async function keyboardReorder(page: Page, handleName: string, key: "ArrowUp" | "ArrowDown", steps = 1) {
  const announcer = page.getByRole("status").filter({ hasText: /Picked up|moved to position|dropped at position/ });
  await page.getByRole("button", { name: handleName, exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(announcer).toContainText("Picked up");
  for (let step = 0; step < steps; step += 1) {
    const previous = await announcer.textContent();
    await page.keyboard.press(key);
    await expect(announcer).toContainText("moved to position");
    await expect(announcer).not.toHaveText(previous ?? "");
  }
  await page.keyboard.press("Space");
  await expect(announcer).toContainText("dropped at position");
}
