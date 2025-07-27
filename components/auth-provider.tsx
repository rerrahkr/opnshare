"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";

// Dummy component to watch authentication state.
export function AuthProvider(): null {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    return initialize();
  }, [initialize]);

  return null;
}
