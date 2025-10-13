importScripts("/wasm/synth.js");

let wasm = null;
let audioSampleRate = 0;

const WASM_NOT_LOADED_MESSAGE = {
  type: "error",
  message: "WASM module is not loaded",
};

async function handleLoadWasm() {
  try {
    wasm = await createSynthModule({
      locateFile: (path) => `/wasm/${path}`,
    });
    self.postMessage({
      type: "loadedWasm",
    });
  } catch (e) {
    self.postMessage({
      type: "error",
      message: `Failed to load WASM module: ${e.message}`,
    });
  }
}

function handleInitialize(sampleRate) {
  if (!wasm) {
    self.postMessage(WASM_NOT_LOADED_MESSAGE);
    return;
  }

  try {
    if (wasm.initialize() === false) {
      throw new Error("Could not initialize");
    }

    if (wasm.setSamplingRate(sampleRate) === false) {
      throw new Error("Could not set sample rate");
    }
    audioSampleRate = sampleRate;

    self.postMessage({
      type: "initialized",
    });
  } catch (e) {
    self.postMessage({
      type: "error",
      message: `Failed to initialize: ${e.message}`,
    });
  }
}

function handleSetInstrument(instrument) {
  if (!wasm) {
    self.postMessage(WASM_NOT_LOADED_MESSAGE);
    return;
  }

  wasm.setInstrument(instrument);
}

function handleKeyOn(id, pitch) {
  if (!wasm) {
    self.postMessage(WASM_NOT_LOADED_MESSAGE);
    return;
  }

  wasm.keyOn(id, pitch.octave, pitch.semitone);
}

function handleKeyOff(id) {
  if (!wasm) {
    self.postMessage(WASM_NOT_LOADED_MESSAGE);
    return;
  }

  wasm.keyOff(id);
}

self.onmessage = async ({ data }) => {
  switch (data.type) {
    case "loadWasm":
      await handleLoadWasm();
      break;

    case "initialize":
      handleInitialize(data.sampleRate);
      break;

    case "setInstrument":
      handleSetInstrument(data.instrument);
      break;

    case "keyOn":
      handleKeyOn(data.id, data.pitch);
      break;

    case "keyOff":
      handleKeyOff(data.id);
      break;

    // For test: Generate audio sample and send it to main thread
    case "testGenerate": {
      if (!wasm) {
        self.postMessage(WASM_NOT_LOADED_MESSAGE);
        return;
      }

      try {
        // Create buffers for 0.25 seconds of audio
        const leftBuffer = new Float32Array(audioSampleRate / 4);
        const rightBuffer = new Float32Array(leftBuffer);

        // Play A4 note
        wasm.keyOn(0, 4, 9); // A4

        // Generate audio samples
        wasm.generate(leftBuffer, rightBuffer, leftBuffer.length / 2);

        wasm.keyOff(0);

        wasm.generate(
          leftBuffer.subarray(leftBuffer.length / 2),
          rightBuffer.subarray(rightBuffer.length / 2),
          leftBuffer.length / 2
        );

        // Send the generated audio data to main thread
        self.postMessage({
          type: "generatedAudio",
          data: {
            left: leftBuffer,
            right: rightBuffer,
            sampleRate: audioSampleRate,
          },
        });
      } catch (e) {
        self.postMessage({
          type: "error",
          message: `Failed to generate audio: ${e.message}`,
        });
      }
      break;
    }

    default:
      break;
  }
};
