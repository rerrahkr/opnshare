import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import type { InstrumentMetaInfo } from "../types";
import { LikeRankingSectionContent } from "./like-ranking";
import { NewInstrumentsSectionContent } from "./new-instruments";
import { SearchBar } from "./search-bar";

type HomePageContentProps = {
  newInstrumentInfoList: InstrumentMetaInfo[];
  likeRankingInfoList: InstrumentMetaInfo[];
};

export function HomePageContent({
  newInstrumentInfoList,
  likeRankingInfoList,
}: HomePageContentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            OPNShare
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore and share FM sound instruments for OPN-series chips used in
            retro game music and chiptunes
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>
        <div className="mt-6">
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://github.com/rerrahkr/opnshare"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <FaGithub className="h-4 w-4" />
              GitHub
            </a>
          </Button>
        </div>
      </section>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* New Arrivals */}
        <section>
          <NewInstrumentsSectionContent infoList={newInstrumentInfoList} />
        </section>

        {/* Like Ranking */}
        <section>
          <LikeRankingSectionContent infoList={likeRankingInfoList} />
        </section>
      </div>
    </div>
  );
}
