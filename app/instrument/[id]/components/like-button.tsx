import type React from "react";
import { startTransition, useEffect, useOptimistic, useState } from "react";
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

  const [optimistic, addOptimistic] = useOptimistic(
    likeState,
    (_, newState: LikeState) => newState
  );

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
    if (!currentUser || likeState.disabled) {
      return;
    }

    const newState: LikeState = {
      isLiked: !optimistic.isLiked,
      likeCount: optimistic.likeCount + (optimistic.isLiked ? -1 : 1),
      disabled: optimistic.disabled,
    };

    startTransition(async () => {
      addOptimistic(newState);

      try {
        if (optimistic.isLiked) {
          await unlikeInstrument(instrumentId, currentUser.uid);
        } else {
          await likeInstrument(instrumentId, currentUser.uid);
        }
        setLikeState(newState);
      } catch {}
    });
  }

  return (
    <Button
      variant={optimistic.isLiked ? "default" : "outline"}
      onClick={handleLikeToggle}
      className="flex items-center gap-2"
      disabled={optimistic.disabled}
    >
      <FaHeart
        className={`h-4 w-4 ${optimistic.isLiked ? "fill-current" : ""}`}
      />
      {optimistic.isLiked ? "Liked" : "Like"}
      <span className="text-sm">{optimistic.likeCount}</span>
    </Button>
  );
}
