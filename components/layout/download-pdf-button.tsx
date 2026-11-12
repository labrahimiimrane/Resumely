"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCv } from "@/hooks/use-cv";
import { cvFileName } from "@/lib/storage/cv-file";
import { downloadFile } from "@/lib/utils";

const ERROR_MESSAGES: Record<number, string> = {
  400: "Your CV couldn't be read for the PDF. Check its content and try again.",
  413: "Your CV is too large to turn into a PDF. Try a smaller photo or less content.",
  503: "The PDF service is busy. Please try again in a moment.",
};
const FALLBACK_ERROR = "Couldn't create your PDF. Please try again.";

type DownloadPdfButtonProps = {
  /** Full-width, always-labelled button for the narrow-screen bottom bar. */
  inBar?: boolean;
};

export function DownloadPdfButton({ inBar = false }: DownloadPdfButtonProps) {
  const { cv } = useCv();
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cv),
      });
      if (!response.ok) {
        toast.error(ERROR_MESSAGES[response.status] ?? FALLBACK_ERROR);
        return;
      }
      downloadFile(await response.blob(), cvFileName(cv, "pdf"));
      toast.success("PDF downloaded");
    } catch {
      toast.error(FALLBACK_ERROR);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      size="sm"
      onClick={download}
      disabled={busy}
      aria-busy={busy}
      className={inBar ? "h-10 flex-1 shadow-sm" : "h-[34px]"}
    >
      {busy ? <Loader2 aria-hidden="true" className="animate-spin" /> : <FileDown aria-hidden="true" />}
      <span className={inBar ? undefined : "max-sm:sr-only"}>{busy ? "Creating PDF…" : "Download PDF"}</span>
    </Button>
  );
}
