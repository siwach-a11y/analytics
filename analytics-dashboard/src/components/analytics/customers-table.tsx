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
import { operators, getOperatorName } from "@/data";
import { formatNumber, formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types";

const lifecycleStyles = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  at_risk: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  churned: "bg-red-500/20 text-red-400 border-red-500/30",
};

function churnRiskColor(risk: number): string {
  if (risk >= 70) return "text-red-400";
  if (risk >= 40) return "text-amber-400";
  return "text-emerald-400";
}

interface CustomersTableProps {
  customers: Customer[];
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const [search, setSearch] = useState("");
  const [operator, setOperator] = useState<string>("all");
  const [lifecycle, setLifecycle] = useState<string>("all");
  const [segment, setSegment] = useState<string>("all");

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        search === "" ||
        c.externalId.toLowerCase().includes(search.toLowerCase()) ||
        c.primaryDApp.toLowerCase().includes(search.toLowerCase()) ||
        c.country.toLowerCase().includes(search.toLowerCase());
      const matchOp = operator === "all" || c.operator === operator;
      const matchLifecycle = lifecycle === "all" || c.lifecycleStage === lifecycle;
      const matchSegment = segment === "all" || c.segment === segment;
      return matchSearch && matchOp && matchLifecycle && matchSegment;
    });
  }, [customers, search, operator, lifecycle, segment]);

  return (
    <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Customer Directory</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {filtered.length} of {customers.length} sample customers
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search ID, feature, country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-48 pl-8 text-xs"
            />
          </div>
          <Select value={operator} onValueChange={setOperator}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              {operators.map((op) => (
                <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={lifecycle} onValueChange={setLifecycle}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue placeholder="Lifecycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="at_risk">At Risk</SelectItem>
              <SelectItem value="churned">Churned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={segment} onValueChange={setSegment}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue placeholder="Segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="defi">DeFi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] uppercase">Customer ID</TableHead>
              <TableHead className="text-[10px] uppercase">Earn Channel</TableHead>
              <TableHead className="text-[10px] uppercase">Primary Feature</TableHead>
              <TableHead className="text-[10px] uppercase">Segment</TableHead>
              <TableHead className="text-[10px] uppercase">Lifecycle</TableHead>
              <TableHead className="text-right text-[10px] uppercase">BNRY Balance</TableHead>
              <TableHead className="text-right text-[10px] uppercase">BNRY Earned</TableHead>
              <TableHead className="text-right text-[10px] uppercase">NPS</TableHead>
              <TableHead className="text-[10px] uppercase">Churn Risk</TableHead>
              <TableHead className="text-[10px] uppercase">Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((customer) => (
              <TableRow key={customer.id} className="font-mono text-xs">
                <TableCell className="font-sans font-semibold">
                  {customer.externalId}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getOperatorName(customer.operator).split(" ")[0]}
                </TableCell>
                <TableCell>{customer.primaryDApp}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-normal capitalize">
                    {customer.segment}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-normal capitalize",
                      lifecycleStyles[customer.lifecycleStage]
                    )}
                  >
                    {customer.lifecycleStage.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(customer.ltv, true)}
                </TableCell>
                <TableCell className="text-right">
                  {customer.monthlySpend > 0
                    ? formatNumber(customer.monthlySpend, true)
                    : "—"}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right",
                    customer.nps >= 50
                      ? "text-emerald-400"
                      : customer.nps >= 0
                        ? "text-foreground"
                        : "text-red-400"
                  )}
                >
                  {customer.nps > 0 ? "+" : ""}
                  {customer.nps}
                </TableCell>
                <TableCell>
                  <div className="flex min-w-[80px] items-center gap-2">
                    <Progress value={customer.churnRisk} className="h-1.5 flex-1" />
                    <span className={cn("text-[10px]", churnRiskColor(customer.churnRisk))}>
                      {customer.churnRisk}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRelativeTime(customer.lastActive)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
