import { useEffect, useRef } from "react";
import type { FmInstrument } from "../instrument/types";
import type { Pitch } from "./pitch";

export type Synthesizer = {
  audioContext: AudioContext;
  wasmWorker: Worker;
  synthNode: AudioNode;

  keyOn: (pitch: Pitch, id: number) => Promise<void>;
  keyOff: (id: number) => void;
  setInstrument: (instrument: FmInstrument) => void;

  // TODO: for test
  testGenerate: () => void;
};

type KeyOnWorkerRequestMessage = {
  type: "keyOn";
  id: number;
  pitch: Pitch;
};

type KeyOffWorkerRequestMessage = {
  type: "keyOff";
  id: number;
};

type SetInstrumentWorkerRequestMessage = {
  type: "setInstrument";
  instrument: FmInstrument;
};

type LoadWasmWorkerRequestMessage = {
  type: "loadWasm";
  loaderUrl: string;
};

type InitializeWorkerRequestMessage = {
  type: "initialize";
  sampleRate: number;
};

type LoadedWasmWorkerResponseMessage = {
  type: "loadedWasm";
};

type InitializedWorkerResponseMessage = {
  type: "initialized";
};

type GeneratedAudioWorkerResponseMessage = {
  type: "generatedAudio";
  data: {
    left: Float32Array;
    right: Float32Array;
    sampleRate: number;
  };
};

type ErrorWorkerResponseMessage = {
  type: "error";
  message: string;
};

type WorkerResponseMessage =
  | LoadedWasmWorkerResponseMessage
  | InitializedWorkerResponseMessage
  | GeneratedAudioWorkerResponseMessage
  | ErrorWorkerResponseMessage;

type ErrorWorkletResponseMessage = {
  type: "error";
  message: string;
};

type WorkletResponseMessage = ErrorWorkletResponseMessage;

/*
 * Synthesizer Workflows
 *
 * [Setup]
 * 1. Main thread requests the worker to load the WASM module.
 * 2. Worker loads the WASM module and responds to the main thread when done.
 * 3. Main thread request the worker to initialize the synthesizer with the audio context's sample rate.
 * 4. Worker initializes the synthesizer and responds to the main thread when done.
 *
 */

export function useSynthesizer() {
  const ref = useRef<Synthesizer>(null);

  useEffect(() => {
    (async () => {
      const wasmWorker = new Worker("/worker/worker.js");
      const audioContext = new AudioContext();
      await audioContext.audioWorklet.addModule("/worklet/processor.js");
      const synthNode = new AudioWorkletNode(audioContext, "processor");
      synthNode.connect(audioContext.destination);

      // Setup message handlers.
      wasmWorker.onmessage = async ({
        data,
      }: MessageEvent<WorkerResponseMessage>) => {
        switch (data.type) {
          case "loadedWasm":
            wasmWorker.postMessage({
              type: "initialize",
              sampleRate: audioContext.sampleRate,
            } satisfies InitializeWorkerRequestMessage);
            break;

          case "initialized":
            console.log("Synthesizer is ready.");
            break;

          case "error":
            console.error("Error from worker:", data.message);
            break;

          case "generatedAudio":
            {
              // Create AudioBuffer from the received data
              const audioBuffer = new AudioBuffer({
                length: data.data.left.length,
                numberOfChannels: 2,
                sampleRate: data.data.sampleRate,
              });
              audioBuffer.getChannelData(0).set(data.data.left);
              audioBuffer.getChannelData(1).set(data.data.right);
            }
            break;

          default:
            console.warn("Unknown message from worker:", data);
            break;
        }
      };

      synthNode.port.onmessage = ({
        data,
      }: MessageEvent<WorkletResponseMessage>) => {
        switch (data.type) {
          case "error":
            console.error("Error from synth processor:", data.message);
            break;

          default:
            console.warn("Unknown message from synth processor:", data);
            break;
        }
      };

      wasmWorker.postMessage({
        type: "loadWasm",
        loaderUrl: "/wasm/synth.js",
      } satisfies LoadWasmWorkerRequestMessage);

      ref.current = {
        audioContext,
        wasmWorker,
        synthNode,

        keyOn: async (pitch, id) => {
          wasmWorker.postMessage({
            type: "keyOn",
            id,
            pitch,
          } satisfies KeyOnWorkerRequestMessage);
          if (audioContext.state !== "running") {
            await audioContext.resume();
          }
        },

        keyOff: (id) => {
          wasmWorker.postMessage({
            type: "keyOff",
            id,
          } satisfies KeyOffWorkerRequestMessage);
        },

        setInstrument: (instrument) => {
          wasmWorker.postMessage({
            type: "setInstrument",
            instrument,
          } satisfies SetInstrumentWorkerRequestMessage);
        },

        // TODO: for test
        testGenerate: () => {
          wasmWorker.postMessage({
            type: "testGenerate",
          });
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
