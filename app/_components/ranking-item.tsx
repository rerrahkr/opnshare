import { useRouter } from "next/navigation";
import type React from "react";
import { FaHeart } from "react-icons/fa";
import { Card } from "@/components/ui/card";

type RankingItemProps = {
  rank: number;
  name: string;
  author: string;
  count: number;
  id: string;
};

export function RankingItem({
  rank,
  author,
  count,
  name,
  id,
}: RankingItemProps): React.JSX.Element {
  const router = useRouter();

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/instrument/${id}`)}
    >
      <div className="flex items-center gap-4">
        <div
          className={`
          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
          ${
            rank === 1
              ? "bg-yellow-500 text-white"
              : rank === 2
                ? "bg-gray-400 text-white"
                : rank === 3
                  ? "bg-amber-600 text-white"
                  : "bg-muted text-muted-foreground"
          }
        `}
        >
          {rank}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-muted-foreground">by {author}</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <FaHeart className="h-4 w-4" />
          {count}
        </div>
      </div>
    </Card>
  );
}
