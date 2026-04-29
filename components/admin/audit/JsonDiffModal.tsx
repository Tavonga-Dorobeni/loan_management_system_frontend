"use client";

import { useState } from "react";
import { Diff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Metadata = Record<string, unknown> | null | undefined;

function pretty(value: unknown): string {
  if (value === null || value === undefined) return "{}";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "[unserializable]";
  }
}

export function JsonDiffModal({
  metadata,
  trigger,
}: {
  metadata: Metadata;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const before = (metadata && (metadata.before ?? metadata.old ?? metadata.previous)) ?? null;
  const after = (metadata && (metadata.after ?? metadata.new ?? metadata.current)) ?? null;
  const hasDiff = before !== null || after !== null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm">
            <Diff className="h-4 w-4" aria-hidden /> Diff
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Metadata diff</DialogTitle>
          <DialogDescription>
            {hasDiff
              ? "Old values on the left, new values on the right."
              : "This entry has no before/after metadata. Showing the raw payload."}
          </DialogDescription>
        </DialogHeader>
        {hasDiff ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Pane label="Before" json={pretty(before)} tone="danger" />
            <Pane label="After" json={pretty(after)} tone="success" />
          </div>
        ) : (
          <Pane label="Metadata" json={pretty(metadata ?? null)} tone="muted" />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Pane({
  label,
  json,
  tone,
}: {
  label: string;
  json: string;
  tone: "success" | "danger" | "muted";
}) {
  const accent =
    tone === "success"
      ? "border-success/30"
      : tone === "danger"
        ? "border-danger/30"
        : "border-input";
  return (
    <div className={`rounded-md border ${accent}`}>
      <div className="border-b px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <pre className="max-h-80 overflow-auto p-3 text-xs leading-relaxed text-foreground">
        <code>{json}</code>
      </pre>
    </div>
  );
}
