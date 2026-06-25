"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { BehavioralEvent, Customer } from "@/types";

const eventStyles: Record<string, string> = {
  payment: "bg-emerald-500/20 text-emerald-400",
  transfer: "bg-blue-500/20 text-blue-400",
  app_open: "bg-muted text-muted-foreground",
  promo_view: "bg-amber-500/20 text-amber-400",
  promo_click: "bg-orange-500/20 text-orange-400",
  campaign_open: "bg-purple-500/20 text-purple-400",
  campaign_convert: "bg-emerald-500/20 text-emerald-400",
  dapp_browse: "bg-indigo-500/20 text-indigo-400",
  wallet_link: "bg-cyan-500/20 text-cyan-400",
};

interface BehaviorEventFeedProps {
  events: BehavioralEvent[];
  customers: Customer[];
}

export function BehaviorEventFeed({ events, customers }: BehaviorEventFeedProps) {
  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c.externalId]));

  return (
    <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold tracking-tight">Live Behavior Feed</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Recent customer actions tracked for campaign targeting
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] uppercase">Customer</TableHead>
              <TableHead className="text-[10px] uppercase">Event</TableHead>
              <TableHead className="text-[10px] uppercase">Action</TableHead>
              <TableHead className="text-[10px] uppercase">Channel</TableHead>
              <TableHead className="text-[10px] uppercase">Campaign</TableHead>
              <TableHead className="text-[10px] uppercase">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id} className="font-mono text-xs">
                <TableCell className="font-sans font-semibold">
                  {customerMap[event.customerId] ?? event.customerId}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] capitalize",
                      eventStyles[event.type] ?? "bg-muted"
                    )}
                  >
                    {event.type.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate font-sans text-muted-foreground">
                  {event.action}
                </TableCell>
                <TableCell className="capitalize">{event.channel.replace("_", " ")}</TableCell>
                <TableCell className="text-muted-foreground">
                  {event.campaignId ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRelativeTime(event.timestamp)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
