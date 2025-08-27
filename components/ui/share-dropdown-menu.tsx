"use client";

import type React from "react";

import { useState } from "react";
import { FaShare } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ShareDropdownMenuProps = {
  messageX: string;
  sharedUrl: string;
};

export function ShareDropdownMenu({
  messageX,
  sharedUrl,
}: ShareDropdownMenuProps): React.JSX.Element {
  const [shareOpen, setShareOpen] = useState(false);

  return (
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
              `https://x.com/intent/post?text=${encodeURIComponent(messageX)}&url=${encodeURIComponent(sharedUrl)}`
            )
          }
        >
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(sharedUrl)}
        >
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
