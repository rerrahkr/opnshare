import type React from "react";
import { useEffect, useState, useTransition } from "react";
import { FaHeart } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  isLikedInstrument,
  likeInstrument,
  unlikeInstrument,
} from "@/features/instrument/api";
import { useAuthUser } from "@/stores/auth";

type LikeState = {
  isLiked: boolean;
  likeCount: number;
  disabled: boolean;
};

type LikeButtonProps = {
  instrumentId: string;
  likeCount: number;
};

export function LikeButton({
  instrumentId,
  likeCount,
}: LikeButtonProps): React.JSX.Element {
  const currentUser = useAuthUser();

  const [likeState, setLikeState] = useState<LikeState>({
    isLiked: false,
    likeCount,
    disabled: true,
  });

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!currentUser) {
      setLikeState((prev) => ({
        likeCount: prev.likeCount,
        isLiked: false,
        disabled: true,
      }));
    } else {
      (async () => {
        const isLiked = await isLikedInstrument(instrumentId, currentUser.uid);
        setLikeState((prev) => ({
          likeCount: prev.likeCount,
          isLiked,
          disabled: false,
        }));
      })();
    }
  }, [currentUser, instrumentId]);

  async function handleLikeToggle() {
    if (isPending || !currentUser || likeState.disabled) {
      return;
    }

    startTransition(async () => {
      try {
        if (likeState.isLiked) {
          await unlikeInstrument(instrumentId, currentUser.uid);
          setLikeState((prev) => ({
            ...prev,
            isLiked: !prev.isLiked,
            likeCount: prev.likeCount - 1,
          }));
        } else {
          await likeInstrument(instrumentId, currentUser.uid);
          setLikeState((prev) => ({
            ...prev,
            isLiked: !prev.isLiked,
            likeCount: prev.likeCount + 1,
          }));
        }
      } catch {}
    });
  }

  return (
    <Button
      variant={likeState.isLiked ? "default" : "outline"}
      onClick={handleLikeToggle}
      className="flex items-center gap-2"
      disabled={likeState.disabled}
    >
      <FaHeart
        className={`h-4 w-4 ${likeState.isLiked ? "fill-current" : ""}`}
      />
      {likeState.isLiked ? "Liked" : "Like"}
      <span className="text-sm">{likeState.likeCount}</span>
    </Button>
  );
}
