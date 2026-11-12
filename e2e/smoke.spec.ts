import { expect, test } from "@playwright/test";

test("typing a full name updates the live preview", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel(/^Full name/).fill("Ada Lovelace");

  const preview = page.getByRole("complementary", { name: "CV preview" });
  await expect(preview.getByRole("heading", { name: "Ada Lovelace" }).first()).toBeVisible();
});
