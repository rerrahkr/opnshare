"use client";

import type React from "react";
import { createContext, use } from "react";
import { type Synthesizer, useSynthesizer } from "@/features/preview/synth";

const FmSynthContext = createContext<ReturnType<typeof useSynthesizer> | null>(
  null
);

export function FmSynthesizerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const synthRef = useSynthesizer();
  return <FmSynthContext value={synthRef}>{children}</FmSynthContext>;
}

export function useFmSynthesizer(): Synthesizer | undefined {
  return use(FmSynthContext)?.current ?? undefined;
}
