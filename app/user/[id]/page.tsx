import type { Timestamp } from "firebase/firestore";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getInstrumentDocsAndIdsByAuthor } from "@/features/instrument/api";
import { getUserDocAndUidByUserId } from "@/features/user/api";
import { InstrumentTabs } from "./components/instrument-tabs";
import { ProfileCard } from "./components/profile-card";
import type { InstrumentMetaInfo } from "./types";

type UserPageParams = {
  params: {
    id: string;
  };
};

export default async function UserPage({ params }: UserPageParams) {
  const { id: userId } = await params;

  const [userDoc, userUid] = await (async () => {
    try {
      const result = await getUserDocAndUidByUserId(userId);
      if (result) {
        return result;
      }
    } catch {}
    notFound();
  })();

  const userName = userDoc.displayName;
  const createdAt = userDoc.createdAt as Timestamp;
  const joinedDateIso = createdAt.toDate().toISOString();

  const instrumentDocsAndIds = await (async () => {
    try {
      return await getInstrumentDocsAndIdsByAuthor(userUid, {
        order: "latest",
      });
    } catch {
      return [];
    }
  })();

  const posts: InstrumentMetaInfo[] = instrumentDocsAndIds.map(
    ([doc, id]) =>
      ({
        id,
        title: doc.name,
        author: userName,
        tags: doc.tags,
        likes: doc.likeCount,
        dateIso: (doc.createdAt as Timestamp).toDate().toISOString(),
      }) satisfies InstrumentMetaInfo
  );

  // TODO: fetch
  const likes: InstrumentMetaInfo[] = [
    {
      id: "2",
      title: "Epic Lead",
      author: "John Doe",
      tags: ["synth", "lead"],
      likes: 50,
      dateIso: "2024-08-02T12:00:00Z",
    },
  ];

  const receivedLikes = posts.reduce((acc, post) => acc + post.likes, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <Suspense fallback={<div>Loading...</div>}>
          <ProfileCard
            userId={userId}
            displayName={userDoc.displayName}
            bio={userDoc.bio}
            joinedDateIso={joinedDateIso}
            numPosts={posts.length}
            receivedLikes={receivedLikes}
          />
          <InstrumentTabs posts={posts} likes={likes} />
        </Suspense>
      </div>
    </div>
  );
}
