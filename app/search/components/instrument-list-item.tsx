import { useRouter } from "next/navigation";
import type React from "react";
import { FaHeart } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { isoStringToLocaleString } from "@/utils/date";

type InstrumentListItemProps = {
  id: string;
  title: string;
  author: string;
  tags: string[];
  likes: number;
  dateIso: string;
};

export function InstrumentListItem({
  id,
  title,
  author,
  tags,
  likes,
  dateIso,
}: InstrumentListItemProps): React.JSX.Element {
  const router = useRouter();

  const date = isoStringToLocaleString(dateIso);

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/instrument/${id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground mb-2">by {author}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>
              <FaHeart className="inline h-3 w-3" /> {likes}
            </div>
            <div>{date}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
