"use client";

import { Header } from "@/components/layout/header";
import { RawDataPanel } from "@/components/bnii/raw-data-panel";

export default function RawDataPage() {
  return (
    <>
      <Header
        title="Raw Data"
        subtitle="Myanmar · Indonesia · Sri Lanka · Vietnam · BNII Analytics API"
      />
      <div className="p-4 lg:p-6">
        <RawDataPanel />
      </div>
    </>
  );
}
