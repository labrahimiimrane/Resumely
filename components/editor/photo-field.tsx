"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Loader2, Upload, UserRound } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCv } from "@/hooks/use-cv";
import { preparePhoto } from "@/lib/cv/photo";

export function PhotoField() {
  const { cv, updateCv } = useCv();
  const { photo, showPhoto } = cv.personal;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    const result = await preparePhoto(file);
    setIsProcessing(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    updateCv((current) => ({
      ...current,
      personal: { ...current.personal, photo: result.dataUrl, showPhoto: true },
    }));
  }

  function removePhoto() {
    updateCv((current) => ({
      ...current,
      personal: { ...current.personal, photo: "", showPhoto: false },
    }));
    setError(null);
    setConfirmOpen(false);
  }

  return (
    <div aria-busy={isProcessing} className="flex flex-col gap-3 rounded-[10px] border bg-background p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-soft text-primary-soft-foreground">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- local data URL, next/image adds nothing here
            <img src={photo} alt="Your profile photo" className="size-full object-cover" />
          ) : (
            <UserRound aria-hidden="true" className="size-6" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium">Profile photo</p>
          <p className="text-xs text-muted-foreground">Optional. JPEG, PNG, or WebP, up to 10 MB.</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={handleFile}
          />
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isProcessing}
            onClick={() => inputRef.current?.click()}
          >
            {isProcessing ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Upload aria-hidden="true" />}
            {isProcessing ? "Processing..." : photo ? "Replace photo" : "Upload photo"}
          </Button>
          {photo ? (
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogTrigger
                render={<Button type="button" variant="ghost" size="lg" disabled={isProcessing} />}
              >
                Remove
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove photo?</AlertDialogTitle>
                  <AlertDialogDescription>Your photo will be removed from this CV.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={removePhoto}>
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
      <div className="flex items-start gap-3 border-t pt-3">
        <Switch
          id="show-photo"
          checked={Boolean(photo) && showPhoto}
          disabled={!photo || isProcessing}
          aria-describedby="show-photo-hint show-photo-templates"
          onCheckedChange={(checked) =>
            updateCv((current) => ({
              ...current,
              personal: { ...current.personal, showPhoto: checked },
            }))
          }
          className="mt-0.5"
        />
        <div className="flex flex-col gap-1">
          <Label htmlFor="show-photo" className="text-[13px]">
            Show photo on CV
          </Label>
          <p id="show-photo-hint" className="text-xs text-muted-foreground">
            Many applicant tracking systems and regions discourage photos.
          </p>
          <p id="show-photo-templates" className="text-xs text-muted-foreground">
            Shown in the Modern and Executive templates.
          </p>
        </div>
      </div>
    </div>
  );
}
