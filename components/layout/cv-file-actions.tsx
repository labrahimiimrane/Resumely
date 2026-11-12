"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useCv } from "@/hooks/use-cv";
import { getCvDisplayName } from "@/lib/cv/document";
import { cvFileName, parseCvFile, serializeCv, type ParseCvFileResult } from "@/lib/storage/cv-file";
import type { CvDocument } from "@/types/cv";

const IMPORT_ERRORS: Record<Extract<ParseCvFileResult, { ok: false }>["reason"], string> = {
  "invalid-json": "That file isn't valid JSON.",
  "unsupported-version": "That file uses an unsupported CV format version.",
  "invalid-cv": "That file isn't a valid Resumely CV.",
};

export function CvFileActions() {
  const { cv, replaceCv } = useCv();
  const inputRef = useRef<HTMLInputElement>(null);
  const importButtonRef = useRef<HTMLButtonElement>(null);
  const [reading, setReading] = useState(false);
  // Kept after closing so the dialog text stays put during its exit animation.
  const [pending, setPending] = useState<CvDocument | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const exportCv = () => {
    try {
      const url = URL.createObjectURL(new Blob([serializeCv(cv)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = cvFileName(cv);
      link.click();
      URL.revokeObjectURL(url);
      toast.success("CV exported");
    } catch {
      toast.error("Couldn't export your CV.");
    }
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setReading(true);
    let text: string;
    try {
      text = await file.text();
    } catch {
      toast.error("Couldn't read that file.");
      return;
    } finally {
      input.value = "";
      setReading(false);
    }
    const result = parseCvFile(text);
    if (result.ok) {
      setPending(result.cv);
      setConfirmOpen(true);
    } else toast.error(IMPORT_ERRORS[result.reason]);
  };

  const confirmImport = () => {
    if (!pending) return;
    replaceCv(pending);
    setConfirmOpen(false);
    toast.success("CV imported");
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={exportCv} className="h-[34px]">
        <Download aria-hidden="true" />
        <span className="max-sm:sr-only">Export JSON</span>
      </Button>
      <Button
        ref={importButtonRef}
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={reading}
        className="h-[34px]"
      >
        <Upload aria-hidden="true" />
        <span className="max-sm:sr-only">Import JSON</span>
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={onFileChange}
      />
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent finalFocus={importButtonRef}>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace current CV?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current CV will be replaced with &ldquo;{pending ? getCvDisplayName(pending) : ""}&rdquo;. You can
              restore it with Undo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>Replace CV</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
