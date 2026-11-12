import "server-only";

import { chromium, type Browser } from "playwright";
import { PDF_RENDER_TIMEOUT_MS } from "@/lib/pdf/limits";
import type { CvDocument } from "@/types/cv";

let browserPromise: Promise<Browser> | null = null;

/** One shared Chromium, launched on first use and relaunched if it fails or disconnects. */
function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    const launching = chromium.launch();
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
 * The app's own server on loopback; never derived from the request, so Chromium can't be pointed elsewhere.
 * `localhost` rather than 127.0.0.1: `next dev` serves its client scripts only to the hostname it started on.
 */
export function loopbackOrigin(): string | null {
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
  const browser = await getBrowser();
  const context = await browser.newContext({ colorScheme: "light" });
  try {
    return await withTimeout(
      (async () => {
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
      })(),
      PDF_RENDER_TIMEOUT_MS,
    );
  } finally {
    await context.close().catch(() => undefined);
  }
}
