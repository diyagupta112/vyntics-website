"use client";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { PreviewDialog } from "./preview-dialog";
import type { PreviewSnapshot } from "./snapshot";
export function PreviewAction({ build, label, className, saved = false }: { saved?: boolean; build: () => PreviewSnapshot; label?: string; className?: string }) {
  const [session, setSession] = useState<{ snapshot: PreviewSnapshot; id: string }>();
  const [error, setError] = useState<string>();
  const close = useCallback(() => setSession(undefined), []);
  return <>
    <Button aria-label={label} className={className} variant="secondary" onClick={(event) => {
      event.stopPropagation();
      try { const snapshot = build(); setSession({ snapshot, id: crypto.randomUUID() }); setError(undefined); }
      catch (caught) { setError(caught instanceof Error ? caught.message : "Preview could not be prepared."); }
    }}>Preview</Button>
    {error ? <p role="alert">{error}</p> : null}
    {session ? <PreviewDialog snapshot={session.snapshot} instanceId={session.id} saved={saved} onClose={close} /> : null}
  </>;
}
