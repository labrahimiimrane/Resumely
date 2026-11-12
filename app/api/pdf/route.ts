import { PDF_MAX_CONCURRENT_RENDERS, PDF_REQUEST_MAX_BYTES } from "@/lib/pdf/limits";
import { loopbackOrigin, renderCvPdf } from "@/lib/pdf/render-pdf";
import { cvFileName } from "@/lib/storage/cv-file";
import { cvDocumentSchema } from "@/lib/validations/cv";

// Runs on the default Node.js runtime; the `runtime` segment config is rejected under cacheComponents.

type PdfErrorCode = "unsupported-media-type" | "too-large" | "invalid-cv" | "busy" | "render-failed";

// Renders in progress in this server process. The app runs as one Node server, so a
// module-level count is enough to bound how many Chromium contexts are open at once.
let activeRenders = 0;

function errorResponse(status: number, error: PdfErrorCode): Response {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

/** Reads the body as text, giving up as soon as it passes `maxBytes` whatever Content-Length claimed. */
async function readCappedText(request: Request, maxBytes: number): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.split(";")[0].trim().toLowerCase() !== "application/json") {
    return errorResponse(415, "unsupported-media-type");
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > PDF_REQUEST_MAX_BYTES) {
    return errorResponse(413, "too-large");
  }

  const text = await readCappedText(request, PDF_REQUEST_MAX_BYTES);
  if (text === null) return errorResponse(413, "too-large");

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return errorResponse(400, "invalid-cv");
  }
  const parsed = cvDocumentSchema.safeParse(data);
  if (!parsed.success) return errorResponse(400, "invalid-cv");
  const cv = parsed.data;

  const origin = loopbackOrigin();
  if (!origin) {
    console.error("PDF render failed: server port is unknown");
    return errorResponse(500, "render-failed");
  }

  // Checked after validation, so rejected requests never take a slot.
  if (activeRenders >= PDF_MAX_CONCURRENT_RENDERS) return errorResponse(503, "busy");

  let pdf: Uint8Array;
  activeRenders += 1;
  try {
    pdf = await renderCvPdf(cv, origin);
  } catch {
    // Generic only: never log the CV or anything derived from it.
    console.error("PDF render failed");
    return errorResponse(500, "render-failed");
  } finally {
    activeRenders -= 1;
  }

  return new Response(Buffer.from(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${cvFileName(cv, "pdf")}"`,
      "Cache-Control": "no-store",
    },
  });
}
