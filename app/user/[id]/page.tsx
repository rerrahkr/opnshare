import type { Timestamp } from "firebase/firestore";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getUserDoc, type UserDoc } from "@/lib/firebase";
import { InstrumentTabs } from "./components/instrument-tabs";
import { ProfileCard } from "./components/profile-card";
import type { InstrumentMetaInfo } from "./types";

export default async function UserPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  let userDoc: UserDoc | undefined;
  try {
    userDoc = await getUserDoc(id);
  } catch {}
  if (userDoc === undefined) {
    notFound();
  }

  const createdAt = userDoc.createdAt as Timestamp;
  const joinedDateIso = createdAt.toDate().toISOString();

  // TODO: fetch
  const posts: InstrumentMetaInfo[] = [
    {
      id: "1",
      title: "Awesome Lead",
      author: userDoc.displayName,
      tags: ["synth", "lead", "clear"],
      downloads: 10,
      likes: 2,
      dateIso: "2023-10-23T12:00:00Z",
    },
    {
      id: "3",
      title: "Awesome Bass",
      author: userDoc.displayName,
      tags: ["bass", "clear"],
      downloads: 5,
      likes: 4,
      dateIso: "2025-07-12T12:00:00Z",
    },
  ];
  // TODO: fetch
  const likedInsts: InstrumentMetaInfo[] = [
    {
      id: "2",
      title: "Epic Lead",
      author: "John Doe",
      tags: ["synth", "lead"],
      downloads: 100,
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
            userId={id}
            displayName={userDoc.displayName}
            bio={userDoc.bio}
            joinedDateIso={joinedDateIso}
            numPosts={posts.length}
            receivedLikes={receivedLikes}
          />
          <InstrumentTabs posts={posts} likedInsts={likedInsts} />
        </Suspense>
      </div>
    </div>
  );
}
