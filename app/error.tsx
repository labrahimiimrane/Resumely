"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Never renders error details: messages and stacks may contain CV text or internals.
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-background px-4 py-12">
      <div role="alert" className="flex max-w-sm flex-col items-center gap-3 text-center">
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          Resumely hit an unexpected problem. Your CV saved in this browser has not been deleted.
        </p>
        <Button onClick={() => retry()} className="mt-2">
          <RotateCcw aria-hidden="true" />
          Try again
        </Button>
      </div>
    </main>
  );
}
