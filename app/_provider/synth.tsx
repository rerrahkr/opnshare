"use client";

import type React from "react";
import { createContext, type RefObject, use, useEffect, useRef } from "react";

type FmSynthContextValue = {
  audioContext: AudioContext;
  synthNode: AudioNode;

  noteOn: () => Promise<void>;
  noteOff: () => Promise<void>;
};

const FmSynthContext =
  createContext<RefObject<FmSynthContextValue | null> | null>(null);

export function FmSynthesizerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const contextRef = useRef<FmSynthContextValue>(null);

  useEffect(() => {
    (async () => {
      const audioContext = new AudioContext();

      const sineNode = new OscillatorNode(audioContext, { type: "sine" });
      sineNode.connect(audioContext.destination);
      sineNode.start();

      contextRef.current = {
        audioContext,
        synthNode: sineNode,
        noteOn: async () => {
          sineNode.frequency.setValueAtTime(440.0, audioContext.currentTime);
          await audioContext.resume();
        },
        noteOff: async () => {
          await audioContext.suspend();
        },
      };
    })();

    return () => {
      if (contextRef.current) {
        contextRef.current.audioContext.close();
        contextRef.current.synthNode.disconnect();
        contextRef.current = null;
      }
    };
  }, []);

  return <FmSynthContext value={contextRef}>{children}</FmSynthContext>;
}

export function useFmSynthesizer(): FmSynthContextValue | undefined {
  return use(FmSynthContext)?.current ?? undefined;
}
