import "server-only";

import { chromium, type Browser, type BrowserContext } from "playwright";
import { PDF_RENDER_TIMEOUT_MS } from "@/lib/pdf/limits";
import type { CvDocument } from "@/types/cv";

let browserPromise: Promise<Browser> | null = null;

/**
 * Vercel functions ship no browser, so there we launch the serverless Chromium build from
 * `@sparticuz/chromium`; everywhere else Playwright's own installed Chromium is used.
 */
async function launchChromium(): Promise<Browser> {
  if (!process.env.VERCEL) return chromium.launch({ timeout: PDF_RENDER_TIMEOUT_MS });
  const { default: serverlessChromium } = await import("@sparticuz/chromium");
  return chromium.launch({
    executablePath: await serverlessChromium.executablePath(),
    args: serverlessChromium.args,
    headless: true,
    timeout: PDF_RENDER_TIMEOUT_MS,
  });
}

/** One shared Chromium, launched on first use and relaunched if it fails or disconnects. */
function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    // Same budget as a render: a stuck launch rejects, clears itself below, and the next request retries.
    const launching = launchChromium();
    browserPromise = launching;
    launching.then(
      (browser) => browser.on("disconnected", () => {
        if (browserPromise === launching) browserPromise = null;
      }),
      () => {
        if (browserPromise === launching) browserPromise = null;
      },
    );
  }
  return browserPromise;
}

/**
 * The origin Chromium loads the print page from; never derived from the request, so Chromium can't be pointed elsewhere.
 * On Vercel there is no long-running server to reach on loopback, so the deployment's own public URL is used
 * (the production domain in production, so Deployment Protection on per-deployment URLs doesn't get in the way).
 * Elsewhere it is the app's own server on loopback; `localhost` rather than 127.0.0.1 because `next dev` serves
 * its client scripts only to the hostname it started on.
 */
export function printOrigin(): string | null {
  if (process.env.VERCEL) {
    const host =
      process.env.VERCEL_ENV === "production"
        ? process.env.VERCEL_PROJECT_PRODUCTION_URL
        : process.env.VERCEL_URL;
    return host ? `https://${host}` : null;
  }
  const port = process.env.PORT;
  return port && /^\d+$/.test(port) ? `http://localhost:${port}` : null;
}

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("PDF render timed out")), ms);
  });
  return Promise.race([work, timeout]).finally(() => clearTimeout(timer));
}

/** Renders a validated CV to PDF bytes through the internal print page. */
export async function renderCvPdf(cv: CvDocument, origin: string): Promise<Uint8Array> {
  // The budget starts here, so a slow cold start (browser launch, new context) can't outlast it.
  const contextPromise = getBrowser().then((browser) => browser.newContext({ colorScheme: "light" }));
  // Set once the context exists; the cast keeps TypeScript from narrowing it to undefined in `finally`.
  let context = undefined as BrowserContext | undefined;
  try {
    return await withTimeout(
      contextPromise.then(async (created) => {
        context = created;
        // Only the app's own origin and inline data may load; everything else is refused.
        await context.route("**/*", (route) => {
          const url = route.request().url();
          if (url.startsWith(`${origin}/`) || url.startsWith("data:")) return route.continue();
          return route.abort();
        });
        const page = await context.newPage();
        await page.addInitScript((data) => {
          window.__RESUMELY_PRINT__ = data;
        }, cv);
        await page.goto(`${origin}/print`, { waitUntil: "load" });
        await page.waitForSelector('[data-pdf-ready="true"]', { state: "attached" });
        const pdf = await page.pdf({
          preferCSSPageSize: true,
          printBackground: true,
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
        });
        return new Uint8Array(pdf);
      }),
      PDF_RENDER_TIMEOUT_MS,
    );
  } finally {
    if (context) await context.close().catch(() => undefined);
    // The deadline passed before the context existed: close it when it arrives, without holding the response.
    else void contextPromise.then((late) => late.close()).catch(() => undefined);
  }
}
