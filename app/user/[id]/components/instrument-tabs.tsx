"use client";

import type React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstrumentCard } from "@/features/instrument/components/instrument-card";
import type { InstrumentMetaInfo } from "../../../types";

type InstrumentTabsProps = {
  posts: InstrumentMetaInfo[];
  likes: InstrumentMetaInfo[];
};

export function InstrumentTabs({
  posts,
  likes,
}: InstrumentTabsProps): React.JSX.Element {
  return (
    <Tabs defaultValue="posts">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="posts">Posted Instruments</TabsTrigger>
        <TabsTrigger value="likes">Liked Instruments</TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <InstrumentCard
              key={post.id}
              id={post.id}
              title={post.name}
              author={post.author}
              likes={post.likes}
              tags={post.tags}
              dateIso={post.dateIso}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="likes" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {likes.map((inst) => (
            <InstrumentCard
              key={inst.id}
              id={inst.id}
              title={inst.name}
              author={inst.author}
              likes={inst.likes}
              tags={inst.tags}
              dateIso={inst.dateIso}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
