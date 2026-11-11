import { PHOTO_MAX, personalSchema } from "@/lib/validations/cv";

export const PHOTO_TYPE_ERROR = "Use a JPEG, PNG, or WebP image";
export const PHOTO_SIZE_ERROR = "Choose an image under 10 MB";
export const PHOTO_COMPRESSED_ERROR = "This photo is too large after compression. Try a smaller image";
export const PHOTO_UNEXPECTED_ERROR = "Something went wrong reading this image. Try another file";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.85;

export type PreparePhotoResult = { ok: true; dataUrl: string } | { ok: false; error: string };

export async function preparePhoto(file: File): Promise<PreparePhotoResult> {
  if (!ACCEPTED_TYPES.includes(file.type)) return { ok: false, error: PHOTO_TYPE_ERROR };
  if (file.size > MAX_FILE_BYTES) return { ok: false, error: PHOTO_SIZE_ERROR };

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { ok: false, error: PHOTO_TYPE_ERROR };
  }

  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return { ok: false, error: PHOTO_UNEXPECTED_ERROR };

    // JPEG has no alpha channel; flatten transparent pixels onto white instead of black.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

    if (dataUrl.length > PHOTO_MAX) return { ok: false, error: PHOTO_COMPRESSED_ERROR };
    if (!personalSchema.shape.photo.safeParse(dataUrl).success) {
      return { ok: false, error: PHOTO_UNEXPECTED_ERROR };
    }
    return { ok: true, dataUrl };
  } catch {
    return { ok: false, error: PHOTO_UNEXPECTED_ERROR };
  } finally {
    bitmap.close();
  }
}
