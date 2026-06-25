"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
