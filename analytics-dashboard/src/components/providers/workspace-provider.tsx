"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getEarnChannels,
  getWorkspace,
  WORKSPACES,
  WORKSPACE_OPTIONS,
  type WorkspaceId,
} from "@/data/workspaces";

const STORAGE_KEY = "analytics-workspace-id";

type WorkspaceContextValue = {
  workspaceId: WorkspaceId;
  workspace: ReturnType<typeof getWorkspace>;
  earnChannels: ReturnType<typeof getEarnChannels>;
  setWorkspaceId: (id: WorkspaceId) => void;
  options: typeof WORKSPACE_OPTIONS;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function readStoredId(): WorkspaceId {
  if (typeof window === "undefined") return "u9";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored in WORKSPACES) {
    return stored as WorkspaceId;
  }
  return "u9";
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaceId, setWorkspaceIdState] = useState<WorkspaceId>("u9");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setWorkspaceIdState(readStoredId());
    setReady(true);
  }, []);

  const setWorkspaceId = useCallback((id: WorkspaceId) => {
    setWorkspaceIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const value = useMemo(() => {
    const workspace = getWorkspace(workspaceId);
    return {
      workspaceId,
      workspace,
      earnChannels: getEarnChannels(workspace),
      setWorkspaceId,
      options: WORKSPACE_OPTIONS,
    };
  }, [workspaceId, setWorkspaceId]);

  if (!ready) {
    const workspace = getWorkspace("u9");
    return (
      <WorkspaceContext.Provider
        value={{
          workspaceId: "u9",
          workspace,
          earnChannels: getEarnChannels(workspace),
          setWorkspaceId,
          options: WORKSPACE_OPTIONS,
        }}
      >
        {children}
      </WorkspaceContext.Provider>
    );
  }

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}
