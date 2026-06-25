"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspace } from "@/components/providers/workspace-provider";
import type { WorkspaceId } from "@/data/workspaces";
import { cn } from "@/lib/utils";

export function CountrySelect({ className }: { className?: string }) {
  const { workspaceId, setWorkspaceId, options } = useWorkspace();

  return (
    <Select value={workspaceId} onValueChange={(v) => setWorkspaceId(v as WorkspaceId)}>
      <SelectTrigger className={cn("h-8 w-[140px] gap-1.5 text-xs lg:w-[168px]", className)}>
        <SelectValue placeholder="Country" />
      </SelectTrigger>
      <SelectContent align="center">
        {options.map((opt) => (
          <SelectItem key={opt.id} value={opt.id} className="text-xs">
            <span className="flex items-center gap-2">
              <span aria-hidden>{opt.flag}</span>
              <span>{opt.country}</span>
              <span className="text-[10px] text-muted-foreground">({opt.code})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
