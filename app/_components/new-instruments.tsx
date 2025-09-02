"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { Button } from "@/components/ui/button";
import { InstrumentCard } from "@/components/ui/instrument-card";
import type { InstrumentMetaInfo } from "../types";

type NewInstrumentSectionContentProps = {
  infoList: InstrumentMetaInfo[];
};

export function NewInstrumentsSectionContent({
  infoList,
}: NewInstrumentSectionContentProps): React.JSX.Element {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">New Instruments</h2>
        <Button
          variant="ghost"
          onClick={() => router.push("/search?sort=newest")}
        >
          View All
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {infoList.map((info) => (
          <InstrumentCard
            key={info.id}
            title={info.name}
            id={info.id}
            author={info.author}
            tags={info.tags}
            likes={info.likes}
            dateIso={info.dateIso}
          />
        ))}
      </div>
    </>
  );
}
