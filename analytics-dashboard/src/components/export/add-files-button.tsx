"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Download,
  FilePlus2,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ADD_GUIDE_MARKDOWN,
  EXPORT_BUNDLES,
  downloadTextFile,
  type ExportBundle,
} from "@/lib/export-bundles";

function CopyCommandButton({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      downloadTextFile("copy-command.txt", command);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 shrink-0 gap-1.5 font-mono text-[10px]"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function BundleCard({ bundle }: { bundle: ExportBundle }) {
  function downloadZip() {
    const link = document.createElement("a");
    link.href = bundle.zipPath;
    link.download = `${bundle.id}.zip`;
    link.click();
  }

  return (
    <div className="rounded-lg border border-border bg-card/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{bundle.name}</p>
            {bundle.route && (
              <Badge variant="outline" className="text-[10px]">{bundle.route}</Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{bundle.description}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5">
        <Terminal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <code className="min-w-0 flex-1 truncate font-mono text-[10px]">{bundle.npmCommand}</code>
        <CopyCommandButton command={bundle.npmCommand} />
      </div>

      <ul className="mt-2 space-y-0.5 text-[10px] text-muted-foreground">
        {bundle.files.map((file) => (
          <li key={file} className="font-mono">{file}</li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" className="h-7 gap-1.5 text-xs" onClick={downloadZip}>
          <Download className="h-3.5 w-3.5" />
          Download zip
        </Button>
        <CopyCommandButton command={bundle.npmCommand} />
      </div>
    </div>
  );
}

export function AddFilesButton({
  className,
  variant = "header",
}: {
  className?: string;
  variant?: "header" | "nav";
}) {
  function downloadAddGuide() {
    downloadTextFile("ADD-analytics-feature.md", ADD_GUIDE_MARKDOWN, "text/markdown");
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {variant === "nav" ? (
          <button
            type="button"
            title="Add Files"
            className={cn(
              "group relative flex w-full items-center gap-3 rounded-md px-2 py-2.5 transition-colors xl:px-3",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              className
            )}
          >
            <FilePlus2 className="mx-auto h-4 w-4 shrink-0 xl:mx-0" />
            <span className="hidden text-xs font-medium xl:inline">Add Files</span>
          </button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("h-8 gap-1.5 text-xs", className)}
          >
            <FilePlus2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Files</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FilePlus2 className="h-4 w-4 text-primary" />
            Add analytics to your project
          </SheetTitle>
          <SheetDescription>
            Copy export bundles into another Next.js app — npm commands or zip downloads.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-3 overflow-y-auto pr-1">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" className="h-7 gap-1.5 text-xs" onClick={downloadAddGuide}>
              <Download className="h-3.5 w-3.5" />
              Download ADD guide
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => downloadTextFile("copy-all.txt", "npm run exports:copy:all")}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy all command
            </Button>
          </div>

          {EXPORT_BUNDLES.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}

          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Run commands from the agenthub repo root. Set{" "}
            <code className="rounded bg-muted px-1">EXPORT_TARGET=your-project/src</code> for a
            custom destination. Zips mirror <code className="rounded bg-muted px-1">exports/</code>{" "}
            folders.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
