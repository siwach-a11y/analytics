"use client";

import { ArrowRight, Lightbulb, Target, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { MarketingRecommendation } from "@/types";

const priorityStyles = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

interface MarketingPlanPanelProps {
  recommendations: MarketingRecommendation[];
}

export function MarketingPlanPanel({ recommendations }: MarketingPlanPanelProps) {
  const sorted = [...recommendations].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold tracking-tight">
          AI-Driven Marketing Plan
        </h3>
        <Badge variant="outline" className="text-[10px]">
          Based on behavioral signals
        </Badge>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {sorted.map((rec) => (
          <div
            key={rec.id}
            className="rounded-lg border border-border bg-card/50 p-4 backdrop-blur-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] capitalize", priorityStyles[rec.priority])}
                  >
                    {rec.priority} priority
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    Reach: {formatNumber(rec.estimatedReach, true)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-snug">{rec.title}</p>
              </div>
              <Zap className="h-4 w-4 shrink-0 text-amber-400" />
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Target className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-foreground">{rec.targetSegment}</p>
                  <p className="text-muted-foreground">{rec.behavioralSignal}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-[10px]">
                <span>
                  <span className="text-muted-foreground">Channel: </span>
                  <span className="font-semibold">{rec.suggestedChannel}</span>
                </span>
                <span>
                  <span className="text-muted-foreground">Expected lift: </span>
                  <span className="font-semibold text-emerald-400">{rec.expectedLift}</span>
                </span>
              </div>
              <p className="leading-relaxed text-muted-foreground">{rec.rationale}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full text-[10px] uppercase"
            >
              Create Campaign Draft
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
