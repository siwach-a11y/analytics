"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { customers } from "@/data/customer-analytics";
import { cn } from "@/lib/utils";
import type { CustomerBehaviorProfile } from "@/types";

const segmentStyles = {
  power_user: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  casual: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  browser: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  dormant_risk: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  reactivation_target: "bg-red-500/20 text-red-400 border-red-500/30",
};

function formatSegment(segment: string): string {
  return segment.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface BehaviorProfilesTableProps {
  profiles: CustomerBehaviorProfile[];
}

export function BehaviorProfilesTable({ profiles }: BehaviorProfilesTableProps) {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<string>("all");

  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c]));

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const customer = customerMap[p.customerId];
      const matchSearch =
        search === "" ||
        customer?.externalId.toLowerCase().includes(search.toLowerCase()) ||
        customer?.primaryDApp.toLowerCase().includes(search.toLowerCase());
      const matchSegment = segment === "all" || p.behavioralSegment === segment;
      return matchSearch && matchSegment;
    });
  }, [profiles, search, segment, customerMap]);

  return (
    <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Behavior Profiles</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Engagement scores and segments for campaign targeting
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-44 pl-8 text-xs"
            />
          </div>
          <Select value={segment} onValueChange={setSegment}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="power_user">Power User</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="browser">Browser</SelectItem>
              <SelectItem value="dormant_risk">Dormant Risk</SelectItem>
              <SelectItem value="reactivation_target">Reactivation Target</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] uppercase">Customer</TableHead>
              <TableHead className="text-[10px] uppercase">Segment</TableHead>
              <TableHead className="text-[10px] uppercase">Engagement</TableHead>
              <TableHead className="text-[10px] uppercase">Frequency</TableHead>
              <TableHead className="text-[10px] uppercase">Preferred Channel</TableHead>
              <TableHead className="text-right text-[10px] uppercase">Events (30d)</TableHead>
              <TableHead className="text-[10px] uppercase">Top Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((profile) => {
              const customer = customerMap[profile.customerId];
              return (
                <TableRow key={profile.customerId} className="font-mono text-xs">
                  <TableCell className="font-sans font-semibold">
                    {customer?.externalId ?? profile.customerId}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        segmentStyles[profile.behavioralSegment]
                      )}
                    >
                      {formatSegment(profile.behavioralSegment)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-[80px] items-center gap-2">
                      <Progress value={profile.engagementScore} className="h-1.5 flex-1" />
                      <span className="text-[10px]">{profile.engagementScore}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{profile.sessionFrequency}</TableCell>
                  <TableCell className="capitalize">
                    {profile.preferredChannel.replace("_", " ")}
                  </TableCell>
                  <TableCell className="text-right">{profile.eventsLast30Days}</TableCell>
                  <TableCell className="font-sans text-[10px] text-muted-foreground">
                    {profile.topActions.join(", ").replace(/_/g, " ")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
