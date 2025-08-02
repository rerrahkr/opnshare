"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { FaCalendar, FaCog, FaHeart, FaMusic, FaShare } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EditableUserDoc } from "@/lib/firebase";
import { useAuthUserId } from "@/stores/auth";
import { isoStringToLocaleString } from "@/utils/date";
import { EditProfileDialog } from "./edit-profile-dialog";

type ProfileProps = {
  userId: string;
  displayName: string;
  bio: string;
  joinedDateIso: string;
  numPosts: number;
  receivedLikes: number;
};

export function ProfileCard({
  userId,
  displayName,
  bio,
  joinedDateIso,
  numPosts,
  receivedLikes,
}: ProfileProps): React.JSX.Element {
  const authUserId = useAuthUserId();
  const isOwnProfile = authUserId === userId;

  const [shareOpen, setShareOpen] = useState<boolean>(false);

  const [profile, setProfile] = useState<EditableUserDoc>({
    displayName,
    bio,
  });

  const [shareUrl, setShareUrl] = useState<string>("");
  useEffect(() => {
    // Update share URL asynchronously because it depend on window object.
    setShareUrl(`${window.location.origin}/user/${userId}`);
  }, [userId]);

  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col">
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{profile.displayName}</h1>
              <p className="text-muted-foreground">@{userId}</p>
            </div>

            <p className="text-muted-foreground">{profile.bio}</p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FaCalendar className="h-4 w-4" />
                Joined {isoStringToLocaleString(joinedDateIso)}
              </div>
              <div className="flex items-center gap-1">
                <FaMusic className="h-4 w-4" />
                Posts: {numPosts}
              </div>
              <div className="flex items-center gap-1">
                <FaHeart className="h-4 w-4" />
                Likes received: {receivedLikes}
              </div>
            </div>

            <div className="flex gap-3 justify-center md:justify-start">
              {isOwnProfile && (
                <>
                  <EditProfileDialog
                    userId={userId}
                    editableProfile={profile}
                    setEditableProfile={setProfile}
                  />

                  <Button variant="outline" asChild>
                    <Link href="/settings">
                      <FaCog className="h-4 w-4 mr-2" />
                      Account Settings
                    </Link>
                  </Button>
                </>
              )}

              <DropdownMenu open={shareOpen} onOpenChange={setShareOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FaShare className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(
                        `https://x.com/intent/post?text=${encodeURIComponent(`Check out ${profile.displayName}'s instruments!`)}&url=${encodeURIComponent(shareUrl)}`
                      )
                    }
                  >
                    Share on X
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                  >
                    Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
