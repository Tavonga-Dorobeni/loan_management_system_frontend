"use client";

import { useId, useState } from "react";
import { CheckCircle2, FileSpreadsheet, Loader2, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toastApiError, toastImportSummary } from "@/components/toasts";
import {
  importApprovals,
  importIntake,
  importRepayments,
  type ImportSummary,
} from "@/lib/api/imports";
import { FailedRowsTable } from "./FailedRowsTable";

export type ImportKind = "intake" | "approvals" | "repayments";

const IMPORTERS: Record<ImportKind, (form: FormData) => Promise<ImportSummary>> = {
  intake: importIntake,
  approvals: importApprovals,
  repayments: importRepayments,
};

const ALLOWED_MIME = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;
const ALLOWED_EXT = ".xlsx";
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB upper bound for bulk imports

type Step = "upload" | "processing" | "results";

export function ExcelImportWizard({
  kind,
  title,
  description,
  templateHref,
}: {
  kind: ImportKind;
  title: string;
  description: string;
  templateHref?: string;
}) {
  const importer = IMPORTERS[kind];
  const inputId = useId();
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  function reset() {
    setStep("upload");
    setFile(null);
    setError(null);
    setSummary(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Choose an Excel file to upload.");
      return;
    }
    const isXlsxByName = file.name.toLowerCase().endsWith(ALLOWED_EXT);
    const isXlsxByMime = (ALLOWED_MIME as readonly string[]).includes(file.type);
    if (!isXlsxByName && !isXlsxByMime) {
      setError("Only .xlsx files are accepted.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File exceeds 25 MB.");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);

    setStep("processing");
    try {
      const result = await importer(fd);
      setSummary(result);
      setStep("results");
      toastImportSummary(result);
    } catch (e) {
      toastApiError(e);
      setStep("upload");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-muted-foreground" aria-hidden />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Stepper step={step} />

        {step === "upload" && (
          <form onSubmit={onSubmit} noValidate className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor={inputId}>Excel file (.xlsx)</Label>
              <Input
                id={inputId}
                type="file"
                accept={ALLOWED_EXT}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {error && (
                <p role="alert" className="text-xs text-danger">
                  {error}
                </p>
              )}
              {templateHref && (
                <p className="text-xs text-muted-foreground">
                  <a href={templateHref} className="underline">
                    Download template
                  </a>{" "}
                  · headers go in row 1, data starts at row 2.
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                <Upload className="h-4 w-4" aria-hidden /> Process file
              </Button>
            </div>
          </form>
        )}

        {step === "processing" && (
          <div className="mt-4 flex items-center gap-3 rounded-md border bg-muted/30 p-6">
            <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
            <div>
              <div className="text-sm font-medium">Processing file…</div>
              <div className="text-xs text-muted-foreground">
                Do not refresh — row-level failures will be reported when this
                completes.
              </div>
            </div>
          </div>
        )}

        {step === "results" && summary && <Results summary={summary} onAgain={reset} />}
      </CardContent>
    </Card>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "upload", label: "Upload" },
    { key: "processing", label: "Processing" },
    { key: "results", label: "Results" },
  ];
  const activeIndex = steps.findIndex((s) => s.key === step);
  return (
    <ol className="flex items-center gap-2 text-xs">
      {steps.map((s, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
                done
                  ? "border-success bg-success text-success-foreground"
                  : active
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-input bg-background text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={
                active
                  ? "font-medium text-foreground"
                  : done
                    ? "text-foreground"
                    : "text-muted-foreground"
              }
            >
              {s.label}
            </span>
            {i < steps.length - 1 && <span className="h-px w-6 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

function Results({
  summary,
  onAgain,
}: {
  summary: ImportSummary;
  onAgain: () => void;
}) {
  const allOk = summary.failureCount === 0;
  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <ResultStat label="Total rows" value={summary.totalRows} tone="muted" />
        <ResultStat label="Succeeded" value={summary.successCount} tone="success" />
        <ResultStat label="Failed" value={summary.failureCount} tone="danger" />
      </div>

      <div className="flex items-center gap-2 text-sm">
        {allOk ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
            <span className="text-foreground">All rows processed.</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-danger" aria-hidden />
            <span className="text-foreground">
              Some rows failed. Fix them in the source file and re-run only those rows.
            </span>
          </>
        )}
      </div>

      <FailedRowsTable rows={summary.failedRows} />

      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={onAgain}>
          Run another import
        </Button>
      </div>
    </div>
  );
}

function ResultStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "danger" | "muted";
}) {
  const color =
    tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-foreground";
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`numeric text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
