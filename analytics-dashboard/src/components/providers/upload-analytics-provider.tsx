"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UploadedFileAnalytics } from "@/types/upload-analytics";

type UploadAnalyticsContextValue = {
  uploads: UploadedFileAnalytics[];
  addUpload: (item: UploadedFileAnalytics) => void;
  removeUpload: (id: string) => void;
  clearUploads: () => void;
  latestUpload: UploadedFileAnalytics | null;
};

const UploadAnalyticsContext = createContext<UploadAnalyticsContextValue | null>(null);

export function UploadAnalyticsProvider({ children }: { children: ReactNode }) {
  const [uploads, setUploads] = useState<UploadedFileAnalytics[]>([]);

  const addUpload = useCallback((item: UploadedFileAnalytics) => {
    setUploads((prev) => [item, ...prev]);
  }, []);

  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => {
      const target = prev.find((u) => u.id === id);
      if (target?.imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(target.imagePreviewUrl);
      }
      return prev.filter((u) => u.id !== id);
    });
  }, []);

  const clearUploads = useCallback(() => {
    setUploads((prev) => {
      prev.forEach((u) => {
        if (u.imagePreviewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(u.imagePreviewUrl);
        }
      });
      return [];
    });
  }, []);

  const latestUpload = uploads[0] ?? null;

  const value = useMemo(
    () => ({ uploads, addUpload, removeUpload, clearUploads, latestUpload }),
    [uploads, addUpload, removeUpload, clearUploads, latestUpload]
  );

  return (
    <UploadAnalyticsContext.Provider value={value}>
      {children}
    </UploadAnalyticsContext.Provider>
  );
}

export function useUploadAnalytics() {
  const ctx = useContext(UploadAnalyticsContext);
  if (!ctx) {
    throw new Error("useUploadAnalytics must be used within UploadAnalyticsProvider");
  }
  return ctx;
}
