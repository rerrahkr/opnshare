import { useEffect, useRef } from "react";
import type { Pitch } from "./pitch";

export type Synthesizer = {
  audioContext: AudioContext;
  wasmWorker: Worker;
  synthNode: AudioNode;

  keyOn: (pitch: Pitch, id: number) => Promise<void>;
  keyOff: (id: number) => Promise<void>;
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

type ErrorWorkerResponseMessage = {
  type: "error";
  message: string;
};

type WorkerResponseMessage =
  | LoadedWasmWorkerResponseMessage
  | InitializedWorkerResponseMessage
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
      const wasmWorker = new Worker("worker/worker.js");
      const audioContext = new AudioContext();
      await audioContext.audioWorklet.addModule("/worklet/processor.js");
      const synthNode = new AudioWorkletNode(audioContext, "processor");

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
            // console.log("Synthesizer is ready.");
            break;

          case "error":
            console.error("Error from worker:", data.message);
            break;

          default:
            console.warn("Unknown message from worker:", data);
            break;
        }
      };
      wasmWorker.postMessage({
        type: "loadWasm",
        loaderUrl: "/wasm/synth.js",
      } satisfies LoadWasmWorkerRequestMessage);
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
      synthNode.connect(audioContext.destination);

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
        keyOff: async (id) => {
          wasmWorker.postMessage({
            type: "keyOff",
            id,
          } satisfies KeyOffWorkerRequestMessage);
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
