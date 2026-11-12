"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCv } from "@/hooks/use-cv";
import { cvFileName } from "@/lib/storage/cv-file";

const ERROR_MESSAGES: Record<number, string> = {
  400: "Your CV couldn't be read for the PDF. Check its content and try again.",
  413: "Your CV is too large to turn into a PDF. Try a smaller photo or less content.",
};
const FALLBACK_ERROR = "Couldn't create your PDF. Please try again.";

export function DownloadPdfButton() {
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
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = cvFileName(cv, "pdf");
      link.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch {
      toast.error(FALLBACK_ERROR);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button size="sm" onClick={download} disabled={busy} aria-busy={busy} className="h-[34px]">
      {busy ? <Loader2 aria-hidden="true" className="animate-spin" /> : <FileDown aria-hidden="true" />}
      <span className="max-sm:sr-only">{busy ? "Creating PDF…" : "Download PDF"}</span>
    </Button>
  );
}
