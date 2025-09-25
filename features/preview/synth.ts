import { useEffect, useRef } from "react";
import type { Pitch } from "./pitch";

export type Synthesizer = {
  audioContext: AudioContext;
  synthNode: AudioNode;

  keyOn: (pitch: Pitch, id: number) => Promise<void>;
  keyOff: (id: number) => Promise<void>;
};

export function useSynthesizer() {
  const ref = useRef<Synthesizer>(null);

  useEffect(() => {
    (async () => {
      const audioContext = new AudioContext();

      const sineNode = new OscillatorNode(audioContext, { type: "sine" });
      sineNode.connect(audioContext.destination);
      sineNode.start();

      ref.current = {
        audioContext,
        synthNode: sineNode,
        keyOn: async (pitch, id) => {
          sineNode.frequency.setValueAtTime(440.0, audioContext.currentTime);
          await audioContext.resume();
        },
        keyOff: async (id) => {
          await audioContext.suspend();
        },
      };
    })();

    return () => {
      if (ref.current) {
        ref.current.audioContext.close();
        ref.current.synthNode.disconnect();
        ref.current = null;
      }
    };
  }, []);

  return ref;
}
