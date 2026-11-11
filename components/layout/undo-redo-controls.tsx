"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Redo2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCv } from "@/hooks/use-cv";

const noopSubscribe = () => () => {};

function useIsMac() {
  return useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );
}

function shortcutBlocked(event: KeyboardEvent) {
  if (event.isComposing) return true;
  if (document.querySelector('[role="alertdialog"]')) return true;
  return document.activeElement?.getAttribute("aria-pressed") === "true";
}

export function UndoRedoControls() {
  const { undo, redo, canUndo, canRedo, revision } = useCv();
  const isMac = useIsMac();
  const modifier = isMac ? "Cmd" : "Ctrl";
  const [message, setMessage] = useState("");
  const focusTarget = useRef<string | null>(null);

  useEffect(() => {
    const id = focusTarget.current;
    focusTarget.current = null;
    if (id) document.getElementById(id)?.focus();
  }, [revision]);

  const run = (direction: "undo" | "redo") => {
    const available = direction === "undo" ? canUndo : canRedo;
    if (!available) {
      setMessage(direction === "undo" ? "Nothing to undo" : "Nothing to redo");
      return;
    }
    focusTarget.current = document.activeElement?.id || null;
    if (direction === "undo") undo();
    else redo();
    setMessage(direction === "undo" ? "Undone" : "Redone");
  };
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      const isUndo = key === "z" && !event.shiftKey;
      const isRedo = (key === "z" && event.shiftKey) || (key === "y" && event.ctrlKey && !event.shiftKey);
      if ((!isUndo && !isRedo) || shortcutBlocked(event)) return;
      event.preventDefault();
      runRef.current(isUndo ? "undo" : "redo");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex items-center">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Undo"
        title={`Undo (${modifier}+Z)`}
        disabled={!canUndo}
        onClick={() => run("undo")}
        className="text-muted-foreground"
      >
        <Undo2 aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Redo"
        title={`Redo (${modifier}+Shift+Z)`}
        disabled={!canRedo}
        onClick={() => run("redo")}
        className="text-muted-foreground"
      >
        <Redo2 aria-hidden="true" />
      </Button>
      <p className="sr-only" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
