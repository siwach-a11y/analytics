"use client";

import { cn } from "@/lib/utils";

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartContainer({
  title,
  subtitle,
  children,
  className,
  action,
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card/50 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-start justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="min-h-[220px] w-full p-4">{children}</div>
    </div>
  );
}
