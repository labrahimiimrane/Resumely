// JSON file export and import. Imported text is untrusted: it is parsed with the CV schema,
// and only the schema output ever becomes the CV.

import { getCvDisplayName } from "@/lib/cv/document";
import { CV_SCHEMA_VERSION, cvDocumentSchema } from "@/lib/validations/cv";
import type { CvDocument } from "@/types/cv";

const FILE_NAME_MAX = 80;

export type ParseCvFileResult =
  | { ok: true; cv: CvDocument }
  | { ok: false; reason: "invalid-json" | "unsupported-version" | "invalid-cv" };

export function serializeCv(cv: CvDocument): string {
  return JSON.stringify(cv, null, 2);
}

/** A safe download name from the CV name: ASCII letters, digits, and hyphens only. */
export function cvFileName(cv: CvDocument, extension: "json" | "pdf" = "json"): string {
  const slug = getCvDisplayName(cv)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, FILE_NAME_MAX)
    .replace(/^-+|-+$/g, "");
  return `${slug || "cv"}.${extension}`;
}

export function parseCvFile(text: string): ParseCvFileResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, reason: "invalid-json" };
  }

  const parsed = cvDocumentSchema.safeParse(data);
  if (parsed.success) return { ok: true, cv: parsed.data };

  const version = typeof data === "object" && data !== null ? (data as { version?: unknown }).version : undefined;
  if (typeof version === "number" && version !== CV_SCHEMA_VERSION) {
    return { ok: false, reason: "unsupported-version" };
  }
  return { ok: false, reason: "invalid-cv" };
}
