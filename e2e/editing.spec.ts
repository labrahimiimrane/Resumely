import { expect, test, type Page } from "@playwright/test";
import { confirmDialog, cvPages, field, openApp, openSection, preview } from "./helpers";

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test("typing a full name updates the live preview", async ({ page }) => {
  await field(page, "Full name").fill("Ada Lovelace");

  await expect(preview(page).getByRole("heading", { name: "Ada Lovelace", level: 1 })).toBeVisible();
});

test("the CV name and full name drive the header", async ({ page }) => {
  const header = page.getByRole("banner");
  await expect(header.getByText("Untitled CV")).toBeVisible();

  await field(page, "Full name").fill("Ada Lovelace");
  await expect(header.getByText("Ada Lovelace")).toBeVisible();

  await field(page, "CV name (optional)").fill("Analyst CV");
  await expect(header.getByText("Analyst CV")).toBeVisible();
});

test("personal details and summary appear in the preview", async ({ page }) => {
  await field(page, "Full name").fill("Ada Lovelace");
  await field(page, "Professional title").fill("Mathematician");
  await field(page, "Email").fill("ada@example.com");
  await field(page, "Phone").fill("+44 20 7946 0000");
  await field(page, "Location (optional)").fill("London, UK");

  const cv = cvPages(page);
  await expect(cv.getByText("Mathematician")).toBeVisible();
  await expect(cv.getByRole("link", { name: "ada@example.com" })).toHaveAttribute("href", "mailto:ada@example.com");
  await expect(cv.getByText("London, UK")).toBeVisible();

  await openSection(page, "Professional summary");
  await field(page, "Summary").fill("Analyst who writes the first published algorithm.");
  await expect(cv.getByText("Analyst who writes the first published algorithm.")).toBeVisible();
});

test("an invalid email shows an attached error that clears once fixed", async ({ page }) => {
  const email = field(page, "Email");
  await email.fill("ada@");
  await email.blur();

  await expect(email).toHaveAttribute("aria-invalid", "true");
  const describedBy = await email.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  const message = page.locator(`[id="${describedBy?.split(" ").at(-1)}"]`);
  await expect(message).toHaveText(/email/i);

  await email.fill("ada@example.com");
  await email.blur();
  await expect(email).not.toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText(/enter a (full|valid) email/i)).toHaveCount(0);
});

async function setDate(page: Page, group: string, month: string, year: string) {
  const fields = page.getByRole("group", { name: group });
  await fields.getByRole("combobox").selectOption({ label: month });
  await fields.getByRole("textbox").fill(year);
}

test("experience entries can be added, edited, and deleted", async ({ page }) => {
  await openSection(page, "Experience");
  await page.getByRole("button", { name: "Add experience" }).click();

  await field(page, "Job title").fill("Data Engineer");
  await field(page, "Company").fill("Analytical Engines Ltd");
  await setDate(page, "Start date", "Jan", "2020");
  await page.getByRole("checkbox", { name: "I currently work here" }).check();

  const cv = cvPages(page);
  await expect(cv.getByRole("heading", { name: "Work Experience" })).toBeVisible();
  await expect(cv.getByRole("heading", { name: "Data Engineer", level: 3 })).toBeVisible();
  await expect(cv.getByText(/Analytical Engines Ltd/)).toBeVisible();
  await expect(cv.getByText(/Jan 2020 - Present/)).toBeVisible();

  await field(page, "Job title").fill("Lead Data Engineer");
  await expect(cv.getByRole("heading", { name: "Lead Data Engineer", level: 3 })).toBeVisible();

  await page.getByRole("button", { name: "Delete Lead Data Engineer, Analytical Engines Ltd" }).click();
  await confirmDialog(page, "Delete");
  await expect(page.getByRole("main").getByRole("article")).toHaveCount(0);
  await expect(cv.getByRole("heading", { name: "Work Experience" })).toHaveCount(0);
});

test("education entries can be added, edited, and deleted", async ({ page }) => {
  await openSection(page, "Education");
  await page.getByRole("button", { name: "Add education" }).click();

  await field(page, "Degree").fill("BSc Mathematics");
  await field(page, "Institution").fill("University of London");
  await setDate(page, "Start date", "Sep", "2015");
  await setDate(page, "End date", "Jun", "2018");

  const cv = cvPages(page);
  await expect(cv.getByRole("heading", { name: "Education" })).toBeVisible();
  await expect(cv.getByText(/BSc Mathematics/)).toBeVisible();
  await expect(cv.getByText(/University of London/)).toBeVisible();

  await field(page, "Degree").fill("MSc Mathematics");
  await expect(cv.getByText(/MSc Mathematics/)).toBeVisible();

  await page.getByRole("button", { name: /^Delete MSc Mathematics/ }).click();
  await confirmDialog(page, "Delete");
  await expect(cv.getByRole("heading", { name: "Education" })).toHaveCount(0);
});

test("skills, projects, certifications, languages, and custom sections reach the preview", async ({ page }) => {
  const cv = cvPages(page);

  await openSection(page, "Skills");
  await page.getByRole("button", { name: "Add skill group" }).click();
  await field(page, "Group name").fill("Tools");
  const skills = field(page, "Skills");
  await skills.fill("Docker");
  await skills.press("Enter");
  await expect(cv.getByText(/Docker/)).toBeVisible();

  await openSection(page, "Projects");
  await page.getByRole("button", { name: "Add project" }).click();
  await field(page, "Project name").fill("Difference Engine Notes");
  await expect(cv.getByText("Difference Engine Notes")).toBeVisible();

  await openSection(page, "Certifications");
  await page.getByRole("button", { name: "Add certification" }).click();
  await field(page, "Certification").fill("Certified Data Analyst");
  await field(page, "Issuing organization").fill("Data Guild");
  await expect(cv.getByText(/Certified Data Analyst/)).toBeVisible();

  await openSection(page, "Languages");
  await page.getByRole("button", { name: "Add language" }).click();
  await field(page, "Language").fill("French");
  await field(page, "Proficiency").fill("Fluent");
  await expect(cv.getByText(/French/)).toBeVisible();

  await openSection(page, "Custom sections");
  await page.getByRole("button", { name: "Add custom section" }).click();
  await field(page, "Section title").fill("Volunteering");
  await field(page, "Content").fill("Weekend maths tutor at the local library.");
  await expect(cv.getByRole("heading", { name: "Volunteering" })).toBeVisible();
  await expect(cv.getByText("Weekend maths tutor at the local library.")).toBeVisible();
});
