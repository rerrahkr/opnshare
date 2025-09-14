import type { Timestamp } from "firebase/firestore";
import { searchInstruments } from "@/features/instrument/api";
import { getUidNameTable } from "@/features/user/api";
import { HomePageContent } from "./_components/content";
import type { InstrumentMetaInfo } from "./types";

const NEW_INSTRUMENT_COUNT = 6;
const LIKE_RANKING_COUNT = 5;

export default async function HomePage() {
  const { docs: newest } = await searchInstruments({
    pageSize: NEW_INSTRUMENT_COUNT,
    sortBy: "newest",
  });
  const { docs: likes } = await searchInstruments({
    pageSize: LIKE_RANKING_COUNT,
    sortBy: "likes",
  });

  const authorUids = [
    ...new Set([
      ...newest.map(([doc]) => doc.authorUid),
      ...likes.map(([doc]) => doc.authorUid),
    ]),
  ];

  const authorTable = await getUidNameTable(authorUids);

  const newerInfoList: InstrumentMetaInfo[] = newest.map(
    ([doc, id]) =>
      ({
        id,
        author: authorTable[doc.authorUid] ?? "",
        tags: doc.tags,
        name: doc.name,
        likes: doc.likeCount,
        dateIso: (doc.createdAt as Timestamp).toDate().toISOString(),
      }) satisfies InstrumentMetaInfo
  );

  const likedInfoList: InstrumentMetaInfo[] = likes.map(
    ([doc, id]) =>
      ({
        id,
        author: authorTable[doc.authorUid] ?? "",
        tags: doc.tags,
        name: doc.name,
        likes: doc.likeCount,
        dateIso: (doc.createdAt as Timestamp).toDate().toISOString(),
      }) satisfies InstrumentMetaInfo
  );

  return (
    <HomePageContent
      newInstrumentInfoList={newerInfoList}
      likeRankingInfoList={likedInfoList}
    />
  );
}
