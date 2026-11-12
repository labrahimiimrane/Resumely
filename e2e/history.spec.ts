import { expect, test } from "@playwright/test";
import { confirmDialog, field, loadExampleCv, openApp, openSection, redoShortcut, undoShortcut } from "./helpers";

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test("undo and redo buttons step one edit at a time and disable at the ends", async ({ page }) => {
  const undo = page.getByRole("button", { name: "Undo" });
  const redo = page.getByRole("button", { name: "Redo" });
  await expect(undo).toBeDisabled();
  await expect(redo).toBeDisabled();

  // Different fields: consecutive edits to one field coalesce into a single undo step.
  await field(page, "Full name").fill("Ada Lovelace");
  await field(page, "Email").fill("ada@example.com");

  await undo.click();
  await expect(field(page, "Email")).toHaveValue("");
  await expect(field(page, "Full name")).toHaveValue("Ada Lovelace");

  await undo.click();
  await expect(field(page, "Full name")).toHaveValue("");
  await expect(undo).toBeDisabled();

  await redo.click();
  await expect(field(page, "Full name")).toHaveValue("Ada Lovelace");
  await redo.click();
  await expect(field(page, "Email")).toHaveValue("ada@example.com");
  await expect(redo).toBeDisabled();
});

test("keyboard shortcuts undo and redo one step", async ({ page }) => {
  await field(page, "Full name").fill("Ada Lovelace");
  await field(page, "Email").fill("ada@example.com");

  await undoShortcut(page);
  await expect(field(page, "Email")).toHaveValue("");
  await expect(field(page, "Full name")).toHaveValue("Ada Lovelace");

  await redoShortcut(page);
  await expect(field(page, "Email")).toHaveValue("ada@example.com");
});

test("undo restores a deleted entry", async ({ page }) => {
  await loadExampleCv(page);
  await openSection(page, "Experience");
  const entries = page.getByRole("main").getByRole("article");
  await expect(entries).toHaveCount(2);

  await page.getByRole("button", { name: "Delete Frontend Engineer, Contoso Retail" }).click();
  await confirmDialog(page, "Delete");
  await expect(entries).toHaveCount(1);

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(entries).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Duplicate Frontend Engineer, Contoso Retail" })).toBeVisible();
});
