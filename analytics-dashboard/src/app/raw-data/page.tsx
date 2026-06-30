"use client";

import { Header } from "@/components/layout/header";
import { RawDataPanel } from "@/components/bnii/raw-data-panel";

export default function RawDataPage() {
  return (
    <>
      <Header
        title="Raw Data"
        subtitle="Myanmar · Indonesia · Philippines · Vietnam · BNII API (Thailand excluded)"
      />
      <div className="p-4 lg:p-6">
        <RawDataPanel />
      </div>
    </>
  );
}
