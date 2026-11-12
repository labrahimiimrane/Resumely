import { expect, test, type Page } from "@playwright/test";
import { field, loadExampleCv, openApp, openSection } from "./helpers";

// Keywords are kept when they repeat (or contain symbols), so each term appears twice.
const JOB_DESCRIPTION =
  "We need React and TypeScript experience. React is our UI stack and TypeScript is required. " +
  "You will run Kubernetes clusters, so Kubernetes skills matter.";

function atsRegion(page: Page) {
  return page.getByRole("region", { name: "ATS analysis" });
}

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test("an empty CV shows the empty state and a way to start", async ({ page }) => {
  await openSection(page, "ATS analysis");
  const ats = atsRegion(page);
  await expect(ats.getByText("Add your details to see how ATS-ready your CV is")).toBeVisible();
  await expect(ats.getByText(/Advisory only\./)).toBeVisible();

  await ats.getByRole("button", { name: "Open Personal information" }).click();
  await expect(page.getByRole("heading", { name: "Personal information", level: 1 })).toBeVisible();
});

test("the example CV gets a score, breakdown, disclaimer, and recommendations", async ({ page }) => {
  await loadExampleCv(page);
  await openSection(page, "ATS analysis");
  const ats = atsRegion(page);

  const overview = ats.getByRole("region", { name: "Score overview" });
  await expect(overview.getByRole("img", { name: /^Score \d+ out of 100$/ })).toBeVisible();
  for (const category of ["Contact details", "Sections", "Formatting", "Completeness"]) {
    await expect(overview.getByRole("listitem").filter({ hasText: category })).toBeVisible();
  }
  await expect(overview.getByText(/Advisory only\. .*no score guarantees/)).toBeVisible();

  // The nav badge mirrors the score.
  const score = (await overview.getByRole("img").getAttribute("aria-label"))!.match(/\d+/)![0];
  await expect(page.getByRole("navigation", { name: "CV sections" }).getByRole("button", { name: /^ATS analysis/ })).toContainText(score);

  const recommendations = ats.getByRole("region", { name: "Recommendations" });
  await expect(recommendations.getByRole("listitem").first()).toBeVisible();
  const fix = recommendations.getByRole("button", { name: /^Fix in / }).first();
  const target = (await fix.textContent())!.replace(/^Fix in /, "").trim();
  await fix.click();
  await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toHaveText(target);
});

test("a pasted job description shows found and missing keywords and is not kept", async ({ page }) => {
  await loadExampleCv(page);
  await openSection(page, "ATS analysis");
  const keywords = atsRegion(page).getByRole("region", { name: "Keywords" });

  await field(page, "Job description").fill(JOB_DESCRIPTION);
  // Screen readers hear the count only once it has settled (1 s without changes). Read once
  // rather than with an auto-retrying assertion, which would wait for the settled text.
  const announcement = keywords.getByRole("status");
  expect(await announcement.textContent()).toBe("");
  await expect(announcement).toHaveText(/^\d+ of \d+ keywords found$/);
  const chips = keywords.getByRole("list", { name: "Job keywords" });
  await expect(chips).toContainText("Found: React");
  await expect(chips).toContainText("Found: TypeScript");
  await expect(chips).toContainText("Missing: Kubernetes");
  const overview = atsRegion(page).getByRole("region", { name: "Score overview" });
  await expect(overview.getByRole("listitem").filter({ hasText: "Keywords" })).toBeVisible();

  // The sidebar badge (and its screen-reader text) shows the same score, keywords included.
  const score = (await overview.getByRole("img").getAttribute("aria-label"))!.match(/\d+/)![0];
  const atsNav = page.getByRole("navigation", { name: "CV sections" }).getByRole("button", { name: /^ATS analysis/ });
  await expect(atsNav).toContainText(`score ${score} out of 100`);

  await page.reload();
  await openSection(page, "ATS analysis");
  await expect(field(page, "Job description")).toHaveValue("");
});
