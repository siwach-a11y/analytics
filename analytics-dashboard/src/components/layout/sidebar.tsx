"use client";

import { useState } from "react";
import { AppLink } from "@/components/app-link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  BarChart3,
  Menu,
  Globe2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AddFilesButton } from "@/components/export/add-files-button";
import { useWorkspace } from "@/components/providers/workspace-provider";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { workspace } = useWorkspace();
  const ws = workspace.workspace;

  const navItems = [
    { href: "/", label: "Home", icon: LayoutDashboard },
    {
      href: "/workspace/u9",
      label: `${ws.code} · ${ws.country}`,
      icon: Globe2,
    },
    { href: "/customers", label: "Subscribers", icon: Users },
    { href: "/marketing", label: "Engagement", icon: Megaphone },
  ];

  return (
    <nav className="flex flex-col gap-0.5">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <AppLink
            key={href}
            href={href}
            onClick={onNavigate}
            title={label}
            className={cn(
              "group relative flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors xl:px-3",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "mx-auto h-4 w-4 shrink-0 xl:mx-0",
                active && "text-primary"
              )}
            />
            <span className="hidden text-xs font-medium xl:inline">{label}</span>
          </AppLink>
        );
      })}
      <AddFilesButton variant="nav" />
    </nav>
  );
}

function SidebarBranding() {
  const { workspace } = useWorkspace();
  const ws = workspace.workspace;

  return (
  <>
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary">
      <BarChart3 className="h-4 w-4 text-primary-foreground" />
    </div>
    <div className="hidden xl:block">
      <p className="text-xs font-bold tracking-tight">{ws.code} Analytics</p>
      <p className="text-[8px] uppercase tracking-widest text-muted-foreground">
        {ws.country} · BNII
      </p>
    </div>
  </>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:w-16 lg:flex-col lg:border-r lg:border-border lg:bg-card xl:w-52">
      <div className="flex h-14 items-center justify-center border-b border-border xl:justify-start xl:gap-2.5 xl:px-4">
        <SidebarBranding />
      </div>

      <div className="flex-1 overflow-y-auto p-2 xl:p-3">
        <NavLinks />
      </div>
    </aside>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { workspace } = useWorkspace();
  const ws = workspace.workspace;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 border-border bg-card p-0">
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold">{ws.code} Analytics</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {ws.country} · BNII
            </p>
          </div>
        </div>
        <div className="p-3">
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
