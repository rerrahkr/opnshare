import { useEffect, useRef } from "react";
import type { FmInstrument } from "../instrument/types";
import type { Pitch } from "./pitch";

export type Synthesizer = {
  audioContext: AudioContext;
  wasmWorker: Worker;
  synthNode: AudioNode;
  sab: SharedArrayBuffer;

  keyOn: (pitch: Pitch, id: number) => Promise<void>;
  keyOff: (id: number) => void;
  setInstrument: (instrument: FmInstrument) => void;
};

const RING_BUFFER_SIZE = 8192;
const RING_BUFFER_CHANNELS = 2;
const RING_BUFFER_BYTE_SIZE =
  RING_BUFFER_SIZE * RING_BUFFER_CHANNELS * Float32Array.BYTES_PER_ELEMENT;
const RING_BUFFER_READ_POS_SIZE = Int32Array.BYTES_PER_ELEMENT;
const RING_BUFFER_WRITE_POS_SIZE = Int32Array.BYTES_PER_ELEMENT;
const RING_BUFFER_CONTROLS_SIZE =
  RING_BUFFER_READ_POS_SIZE + RING_BUFFER_WRITE_POS_SIZE;
const SAB_SIZE = RING_BUFFER_CONTROLS_SIZE + RING_BUFFER_BYTE_SIZE;

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
  sab: SharedArrayBuffer;
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

type InitializeWorkletRequestMessage = {
  type: "initialize";
  sab: SharedArrayBuffer;
};

type InitializedWorkletResponseMessage = {
  type: "initialized";
};

type ErrorWorkletResponseMessage = {
  type: "error";
  message: string;
};

type WorkletResponseMessage =
  | InitializedWorkletResponseMessage
  | ErrorWorkletResponseMessage;

/*
 * Synthesizer Workflows
 *
 * [Setup]
 * 1. Main thread requests the worker to load the WASM module.
 * 2. Worker loads the WASM module and responds to the main thread when done.
 * 3. Main thread request the worker to initialize the synthesizer with the
 *    audio context's sample rate.
 * 4. Worker initializes the synthesizer and responds to the main thread when
 *    done.
 *
 * [Streaming]
 * 1. Pull samples from the ring buffer in the Audio Worklet's process().
 * 2. The worker monitors the ring buffer and generates samples when the
 *    remaining count gets low, then packs them into the buffer.
 */

export function useSynthesizer() {
  const ref = useRef<Synthesizer>(null);

  useEffect(() => {
    (async () => {
      /**
       * SharedArrayBuffer is mapped following data:
       * - [Int32] Start position in ring buffer
       * - [Int32] End position in ring buffer
       * - [Float32 * BUFFER_SIZE] Left channel of ring buffer
       * - [Float32 * BUFFER_SIZE] Right channel of ring buffer
       *
       * It is necessary to use Atomics API to read and write positions.
       */
      const sab = new SharedArrayBuffer(SAB_SIZE);

      const wasmWorker = new Worker("/worker/worker.js");
      const audioContext = new AudioContext();
      await audioContext.audioWorklet.addModule("/worklet/processor.js");
      const synthNode = new AudioWorkletNode(audioContext, "processor", {
        numberOfOutputs: 1,
        outputChannelCount: [2],
      });
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
              sab,
            } satisfies InitializeWorkerRequestMessage);
            break;

          case "initialized":
            // console.log("Synthesizer is ready.");
            break;

          case "error":
            console.error("Error from worker:", data.message);
            break;

          default:
            console.error("Unknown message from worker:", data);
            break;
        }
      };

      synthNode.port.onmessage = ({
        data,
      }: MessageEvent<WorkletResponseMessage>) => {
        switch (data.type) {
          case "initialized":
            // console.log("worklet is ready.");
            break;

          case "error":
            console.error("Error from synth processor:", data.message);
            break;

          default:
            console.error("Unknown message from synth processor:", data);
            break;
        }
      };

      wasmWorker.postMessage({
        type: "loadWasm",
        loaderUrl: "/wasm/synth.js",
      } satisfies LoadWasmWorkerRequestMessage);

      synthNode.port.postMessage({
        type: "initialize",
        sab,
      } satisfies InitializeWorkletRequestMessage);

      ref.current = {
        audioContext,
        wasmWorker,
        synthNode,
        sab,

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
      };
    })();

    return () => {
      if (ref.current) {
        ref.current.audioContext.close();
        ref.current.synthNode.disconnect();
        ref.current.wasmWorker.terminate();
        ref.current = null;
      }
    };
  }, []);

  return ref;
}
