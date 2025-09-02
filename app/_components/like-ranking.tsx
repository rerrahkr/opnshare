"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { Button } from "@/components/ui/button";
import type { InstrumentMetaInfo } from "../types";
import { RankingItem } from "./ranking-item";

type LikeRankingSectionContentProps = {
  infoList: InstrumentMetaInfo[];
};

export function LikeRankingSectionContent({
  infoList,
}: LikeRankingSectionContentProps): React.JSX.Element {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Like Ranking</h2>
        <Button
          variant="ghost"
          onClick={() => router.push("/search?sort=likes")}
        >
          View All
        </Button>
      </div>
      <div className="space-y-3">
        {infoList.map((info, i) => (
          <RankingItem
            key={`${i}-${info.id}`}
            rank={i + 1}
            author={info.author}
            count={info.likes}
            name={info.name}
            id={info.id}
          />
        ))}
      </div>
    </>
  );
}
