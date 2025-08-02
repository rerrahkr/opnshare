"use client";

import type React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InstrumentMetaInfo } from "../types";
import { InstrumentCard } from "./instrument-card";

type InstrumentTabsProps = {
  posts: InstrumentMetaInfo[];
  likedInsts: InstrumentMetaInfo[];
};

export function InstrumentTabs(props: InstrumentTabsProps): React.JSX.Element {
  return (
    <Tabs defaultValue="posts">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="posts">Posted Instruments</TabsTrigger>
        <TabsTrigger value="likes">Liked Instruments</TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {props.posts.map((post) => (
            <InstrumentCard key={post.id} info={post} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="likes" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {props.likedInsts.map((inst) => (
            <InstrumentCard key={inst.id} info={inst} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
