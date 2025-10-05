import { useEffect, useRef } from "react";
import type { Pitch } from "./pitch";

export type Synthesizer = {
  audioContext: AudioContext;
  synthNode: AudioNode;

  keyOn: (pitch: Pitch, id: number) => Promise<void>;
  keyOff: (id: number) => Promise<void>;
};

type KeyOnRequestMessage = {
  type: "keyOn";
  id: number;
  pitch: Pitch;
};

type KeyOffRequestMessage = {
  type: "keyOff";
  id: number;
};

export function useSynthesizer() {
  const ref = useRef<Synthesizer>(null);

  useEffect(() => {
    (async () => {
      const audioContext = new AudioContext();

      await audioContext.audioWorklet.addModule("/processor.js");

      const synthNode = new AudioWorkletNode(audioContext, "processor");
      synthNode.connect(audioContext.destination);

      ref.current = {
        audioContext,
        synthNode,
        keyOn: async (pitch, id) => {
          synthNode.port.postMessage({
            type: "keyOn",
            id,
            pitch,
          } satisfies KeyOnRequestMessage);

          if (audioContext.state !== "running") {
            await audioContext.resume();
          }
        },
        keyOff: async (id) => {
          synthNode.port.postMessage({
            type: "keyOff",
            id,
          } satisfies KeyOffRequestMessage);
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
