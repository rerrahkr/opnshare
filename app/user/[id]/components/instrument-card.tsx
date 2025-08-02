import { useRouter } from "next/navigation";
import { FaDownload, FaHeart } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isoStringToLocaleString } from "@/utils/date";
import type { InstrumentMetaInfo } from "../types";

type InstrumentCardProps = {
  info: InstrumentMetaInfo;
};

export function InstrumentCard({
  info: { id, title, author, tags, downloads, likes, dateIso },
}: InstrumentCardProps): React.JSX.Element {
  const router = useRouter();

  const date = isoStringToLocaleString(dateIso);

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push(`/instrument/${id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">by {author}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <FaDownload className="h-3 w-3" />
                {downloads}
              </span>
              <span className="flex items-center gap-1">
                <FaHeart className="h-3 w-3" />
                {likes}
              </span>
            </div>
            <span>{date}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
