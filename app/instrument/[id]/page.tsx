import type { Timestamp } from "firebase/firestore";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { getInstrumentDoc } from "@/features/instrument/api";
import { getUserDoc } from "@/features/user/api";
import { InstrumentDetailContent } from "./components/content";

export default async function InstrumentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const instrumentDoc = await (async () => {
    try {
      const instrumentDoc = await getInstrumentDoc(id);
      if (instrumentDoc) {
        return instrumentDoc;
      }
    } catch {}
    notFound();
  })();

  const createdDate = (instrumentDoc.createdAt as Timestamp)
    .toDate()
    .toISOString();

  const userDoc = await (async () => {
    try {
      const userDoc = await getUserDoc(instrumentDoc.authorUid);
      if (userDoc) {
        return userDoc;
      }
    } catch {}
    notFound();
  })();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Navigation */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/search">
            <FaArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>
        </Button>
      </div>

      {/* Main Content */}
      <InstrumentDetailContent
        id={id}
        authorName={userDoc.displayName}
        authorUserId={userDoc.userId}
        createdDateIso={createdDate}
        data={instrumentDoc.data}
        description={instrumentDoc.description}
        likeCount={instrumentDoc.likeCount}
        name={instrumentDoc.name}
        recommendedChip={instrumentDoc.chip}
        tags={instrumentDoc.tags}
      />
    </div>
  );
}
