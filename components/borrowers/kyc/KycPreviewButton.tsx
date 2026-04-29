"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KycPreviewButton({ signedUrl }: { signedUrl: string }) {
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={signedUrl} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="h-4 w-4" aria-hidden /> Preview
      </Link>
    </Button>
  );
}
