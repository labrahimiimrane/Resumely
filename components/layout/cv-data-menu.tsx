"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Database, Download, Sparkles, Trash2, Upload } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCv } from "@/hooks/use-cv";
import { getCvDisplayName, isCvEmpty } from "@/lib/cv/document";
import { createExampleCv } from "@/lib/cv/example";
import { cvFileName, parseCvFile, serializeCv, type ParseCvFileResult } from "@/lib/storage/cv-file";
import type { CvDocument } from "@/types/cv";

const IMPORT_ERRORS: Record<Extract<ParseCvFileResult, { ok: false }>["reason"], string> = {
  "invalid-json": "That file isn't valid JSON.",
  "unsupported-version": "That file uses an unsupported CV format version.",
  "invalid-cv": "That file isn't a valid Resumely CV.",
};

type OpenDialog = "import" | "example" | "clear" | null;

export function CvDataMenu() {
  const { cv, replaceCv, resetCv } = useCv();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [reading, setReading] = useState(false);
  // Kept after closing so the import dialog text stays put during its exit animation.
  const [pending, setPending] = useState<CvDocument | null>(null);
  const [dialog, setDialog] = useState<OpenDialog>(null);

  const dialogProps = (name: Exclude<OpenDialog, null>) => ({
    open: dialog === name,
    onOpenChange: (open: boolean) => setDialog(open ? name : null),
  });

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
      setDialog("import");
    } else toast.error(IMPORT_ERRORS[result.reason]);
  };

  const confirmImport = () => {
    if (!pending) return;
    replaceCv(pending);
    setDialog(null);
    toast.success("CV imported");
  };

  const loadExample = () => {
    replaceCv(createExampleCv());
    setDialog(null);
    toast.success("Example CV loaded");
  };

  const clearData = () => {
    setDialog(null);
    if (resetCv()) toast.success("Stored data cleared");
    else toast.error("Couldn't clear stored data in this browser.");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          ref={triggerRef}
          render={<Button variant="outline" size="sm" className="h-[34px]" />}
        >
          <Database aria-hidden="true" />
          <span className="max-lg:sr-only">CV data</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-48">
          <DropdownMenuItem onClick={exportCv}>
            <Download aria-hidden="true" />
            Export JSON
          </DropdownMenuItem>
          {/* The file picker opens inside this click handler so the browser keeps the user activation. */}
          <DropdownMenuItem disabled={reading} onClick={() => inputRef.current?.click()}>
            <Upload aria-hidden="true" />
            Import JSON…
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => (isCvEmpty(cv) ? loadExample() : setDialog("example"))}>
            <Sparkles aria-hidden="true" />
            Load example CV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDialog("clear")}>
            <Trash2 aria-hidden="true" />
            Clear stored data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={onFileChange}
      />

      <AlertDialog {...dialogProps("import")}>
        <AlertDialogContent finalFocus={triggerRef}>
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

      <AlertDialog {...dialogProps("example")}>
        <AlertDialogContent finalFocus={triggerRef}>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace current CV?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current CV will be replaced with the example CV. You can restore it with Undo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={loadExample}>Load example</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog {...dialogProps("clear")}>
        <AlertDialogContent finalFocus={triggerRef}>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear stored data?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes your CV from this browser and starts a new empty CV. This can&rsquo;t be undone. Use
              Export JSON first if you want to keep a copy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={clearData}>
              Clear data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
