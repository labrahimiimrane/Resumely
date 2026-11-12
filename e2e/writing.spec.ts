import { expect, test, type Page } from "@playwright/test";
import { cvPages, field, openApp, openSection } from "./helpers";

/** Collects requests that leave the app's origin; writing help must stay fully local. */
function trackExternalRequests(page: Page, origin: string): string[] {
  const external: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith("http") && url.origin !== origin) external.push(request.url());
  });
  return external;
}

/** Opens the "Writing help" disclosure inside the given container. */
async function openWritingHelp(scope: ReturnType<Page["getByRole"]>) {
  await scope.getByText("Writing help", { exact: true }).click();
}

test("writing help inserts text without leaving the browser", async ({ page, baseURL }) => {
  const external = trackExternalRequests(page, new URL(baseURL!).origin);
  await openApp(page);

  // Summary example.
  await openSection(page, "Professional summary");
  const summaryRegion = page.getByRole("region", { name: "Professional summary" });
  await openWritingHelp(summaryRegion);
  await page.getByRole("button", { name: "Insert summary example 2" }).click();
  await expect(field(page, "Summary")).toHaveValue(/^Software engineer with 6 years of experience/);
  await expect(cvPages(page).getByText(/Software engineer with 6 years of experience/)).toBeVisible();

  // Action verb into an experience achievement.
  await openSection(page, "Experience");
  await page.getByRole("button", { name: "Add experience" }).click();
  const achievements = page.getByRole("group", { name: "Achievements" });
  await openWritingHelp(achievements);
  const verbButton = achievements.getByRole("button", { name: /^Insert action verb "/ }).first();
  const verb = (await verbButton.getAttribute("aria-label"))!.match(/"(.+)"/)![1];
  await verbButton.click();
  await expect(achievements.getByRole("textbox").first()).toHaveValue(new RegExp(`^${verb}`));

  // Skill suggestion.
  await openSection(page, "Skills");
  await page.getByRole("button", { name: "Add skill group" }).click();
  const skillsRegion = page.getByRole("region", { name: "Skills" });
  await openWritingHelp(skillsRegion);
  const skillButton = skillsRegion.getByRole("button", { name: /^Add skill "/ }).first();
  const skill = (await skillButton.getAttribute("aria-label"))!.match(/"(.+)"/)![1];
  await skillButton.click();
  await expect(cvPages(page).getByRole("listitem").filter({ hasText: new RegExp(`^${skill}$`) })).toBeVisible();

  expect(external).toEqual([]);
});

test("each section shows its writing tips", async ({ page }) => {
  await openApp(page);
  for (const section of ["Personal information", "Professional summary", "Experience", "Skills"]) {
    await openSection(page, section);
    const region = page.getByRole("region", { name: section });
    await region.getByText("Writing tips", { exact: true }).click();
    await expect(region.getByRole("listitem").first()).toBeVisible();
  }
});
