"use client";

import { useState } from "react";

export function useSniperState() {
  const [huntRefreshKey, setHuntRefreshKey] = useState(0);
  const [snipeSuccess, setSnipeSuccess] = useState<string | null>(null);

  const onHuntStarted = (name: string) => {
    setHuntRefreshKey((k) => k + 1);
    setSnipeSuccess(`Snipe started for ${name}! Watch progress below.`);
    setTimeout(() => setSnipeSuccess(null), 5000);
  };

  return { huntRefreshKey, snipeSuccess, onHuntStarted };
}
