export { cn } from "cn"

// How long a download's blob URL stays alive after the click.
const DOWNLOAD_URL_TTL_MS = 10_000

/**
 * Downloads a blob as a file through a detached `<a download>` click. The URL is revoked
 * later rather than right after the click: some Safari/WebKit versions drop the download
 * when the blob URL is revoked before the browser has started reading it.
 */
export function downloadFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_TTL_MS)
}
