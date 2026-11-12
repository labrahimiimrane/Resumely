/** Largest accepted PDF request body: room for a maximum-size photo plus normal CV content. */
export const PDF_REQUEST_MAX_BYTES = 2 * 1024 * 1024;

/** Overall budget for rendering one PDF, from getting the browser to the finished file. Also caps a Chromium launch. */
export const PDF_RENDER_TIMEOUT_MS = 20_000;
