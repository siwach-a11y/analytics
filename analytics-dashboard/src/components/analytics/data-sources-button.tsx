"use client";

import { FileUp, ImageIcon, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataUploadButtons } from "@/components/analytics/data-upload-buttons";
import { ApiPluginPanel } from "@/components/api-plugin/api-plugin-panel";
import { cn } from "@/lib/utils";

type DataSourcesButtonProps = {
  className?: string;
  size?: "default" | "sm";
  onDataAdded?: () => void;
};

export function DataSourcesButton({
  className,
  size = "sm",
  onDataAdded,
}: DataSourcesButtonProps) {
  function handleAdded() {
    document.getElementById("imported-data")?.scrollIntoView({ behavior: "smooth" });
    onDataAdded?.();
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={size === "sm" ? "sm" : "default"}
          className={cn("gap-1.5", size === "sm" && "h-8 text-xs", className)}
        >
          <FileUp className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
          <span>Add data</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add data for analysis</SheetTitle>
          <SheetDescription>
            Upload a picture or PDF, or connect an API — all sources run through the analytics pipeline on Home.
          </SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="upload" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="gap-1.5 text-xs">
              <ImageIcon className="h-3.5 w-3.5" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-1.5 text-xs">
              <Plug className="h-3.5 w-3.5" />
              API
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <DataUploadButtons size="default" onUploaded={handleAdded} />
          </TabsContent>
          <TabsContent value="api" className="mt-4">
            <ApiPluginPanel onConnected={handleAdded} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
