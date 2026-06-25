"use client";

import { useRef, useState } from "react";
import { FileText, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadAnalytics } from "@/components/providers/upload-analytics-provider";
import { parseImageFile, parsePdfFile } from "@/lib/upload-analytics";
import { cn } from "@/lib/utils";

type DataUploadButtonsProps = {
  className?: string;
  size?: "default" | "sm";
  onUploaded?: () => void;
};

export function DataUploadButtons({
  className,
  size = "default",
  onUploaded,
}: DataUploadButtonsProps) {
  const { addUpload } = useUploadAnalytics();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<"image" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImage(file: File) {
    setError(null);
    setLoading("image");
    try {
      const result = await parseImageFile(file);
      addUpload(result);
      onUploaded?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read picture.");
    } finally {
      setLoading(null);
    }
  }

  async function handlePdf(file: File) {
    setError(null);
    setLoading("pdf");
    try {
      const result = await parsePdfFile(file);
      addUpload(result);
      onUploaded?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read PDF.");
    } finally {
      setLoading(null);
    }
  }

  const btnClass = size === "sm" ? "h-8 gap-1.5 text-xs" : "gap-2";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImage(file);
            e.target.value = "";
          }}
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handlePdf(file);
            e.target.value = "";
          }}
        />

        <Button
          type="button"
          size={size === "sm" ? "sm" : "default"}
          className={btnClass}
          disabled={loading !== null}
          onClick={() => imageInputRef.current?.click()}
        >
          {loading === "image" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
          Upload picture
        </Button>

        <Button
          type="button"
          variant="secondary"
          size={size === "sm" ? "sm" : "default"}
          className={btnClass}
          disabled={loading !== null}
          onClick={() => pdfInputRef.current?.click()}
        >
          {loading === "pdf" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Upload PDF
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
