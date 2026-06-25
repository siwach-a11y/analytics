"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { getOperatorName } from "@/data";
import { formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { MarketingCampaign } from "@/types";

const statusStyles = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-muted text-muted-foreground border-border",
  paused: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const typeStyles = {
  retention: "text-emerald-400",
  acquisition: "text-blue-400",
  reactivation: "text-amber-400",
  cross_sell: "text-purple-400",
};

interface CampaignsTableProps {
  campaigns: MarketingCampaign[];
}

export function CampaignsTable({ campaigns }: CampaignsTableProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<string>("all");

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      const matchSearch =
        search === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.behavioralTrigger.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === "all" || c.status === status;
      const matchType = type === "all" || c.type === type;
      return matchSearch && matchStatus && matchType;
    });
  }, [campaigns, search, status, type]);

  return (
    <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Campaign Tracker</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {filtered.length} campaigns · behavioral triggers & performance
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-44 pl-8 text-xs"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="retention">Retention</SelectItem>
              <SelectItem value="acquisition">Acquisition</SelectItem>
              <SelectItem value="reactivation">Reactivation</SelectItem>
              <SelectItem value="cross_sell">Cross-sell</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] uppercase">Campaign</TableHead>
              <TableHead className="text-[10px] uppercase">Type</TableHead>
              <TableHead className="text-[10px] uppercase">Status</TableHead>
              <TableHead className="text-[10px] uppercase">Trigger</TableHead>
              <TableHead className="text-[10px] uppercase">Channel</TableHead>
              <TableHead className="text-right text-[10px] uppercase">Conv.</TableHead>
              <TableHead className="text-right text-[10px] uppercase">CVR</TableHead>
              <TableHead className="text-right text-[10px] uppercase">ROAS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((campaign) => (
              <TableRow key={campaign.id} className="font-mono text-xs">
                <TableCell>
                  <div>
                    <p className="font-sans font-semibold">{campaign.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {getOperatorName(campaign.operator).split(" ")[0]}
                    </p>
                  </div>
                </TableCell>
                <TableCell className={cn("capitalize", typeStyles[campaign.type])}>
                  {campaign.type.replace("_", "-")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] capitalize", statusStyles[campaign.status])}
                  >
                    {campaign.status}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[160px] truncate font-sans text-[10px] text-muted-foreground">
                  {campaign.behavioralTrigger}
                </TableCell>
                <TableCell className="capitalize">{campaign.channel.replace("_", " ")}</TableCell>
                <TableCell className="text-right">
                  {campaign.conversions > 0 ? formatNumber(campaign.conversions, true) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {campaign.conversionRate > 0 ? `${campaign.conversionRate.toFixed(1)}%` : "—"}
                </TableCell>
                <TableCell className="text-right text-emerald-400">
                  {campaign.roas > 0 ? `${campaign.roas.toFixed(1)}x` : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
