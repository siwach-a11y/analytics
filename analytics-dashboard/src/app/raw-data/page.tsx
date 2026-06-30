"use client";

import { Header } from "@/components/layout/header";
import { RawDataPanel } from "@/components/bnii/raw-data-panel";

export default function RawDataPage() {
  return (
    <>
      <Header
        title="Raw Data"
        subtitle="BNII Analytics API (4 countries) · Telecommunications (Thailand U3)"
      />
      <div className="p-4 lg:p-6">
        <RawDataPanel />
      </div>
    </>
  );
}
