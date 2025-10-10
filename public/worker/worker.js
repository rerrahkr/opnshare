importScripts("/wasm/synth.js");

let wasm = null;

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
    self.postMessage({
      type: "error",
      message: "WASM module is not loaded",
    });
    return;
  }

  try {
    if (wasm.initialize() === false) {
      throw new Error("Could not initialize");
    }

    if (wasm.setSamplingRate(sampleRate) === false) {
      throw new Error("Could not set sample rate");
    }

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

self.onmessage = async ({ data }) => {
  switch (data.type) {
    case "loadWasm":
      await handleLoadWasm();
      break;

    case "initialize":
      handleInitialize(data.sampleRate);
      break;

    default:
      break;
  }
};
