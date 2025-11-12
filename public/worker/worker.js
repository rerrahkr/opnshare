importScripts("/wasm/synth.js");

let wasm;

/** @type {Int32Array} */
let control;
const SAB_CONTROL_SIZE = 2;
const SAB_READ_POSITION_INDEX = 0;
const SAB_WRITE_POSITION_INDEX = 1;

/** @type {Float32Array} */
let leftBuffer;
/** @type {Float32Array} */
let rightBuffer;
/** @type {number} */
let bufferSize, fillThreshold;

const messageQueue = [];

/**
 * @typedef Pitch
 * @property {number} octave  - Octave number (e.g., 4 = around middle C)
 * @property {number} semitone - Index within the octave (0–11)
 */

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

/**
 * @param {number} sampleRate
 * @param {SharedArrayBuffer} sab
 */
function handleInitialize(sampleRate, sab) {
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
  } catch (e) {
    self.postMessage({
      type: "error",
      message: `Failed to initialize: ${e.message}`,
    });
  }

  control = new Int32Array(sab, 0, SAB_CONTROL_SIZE);
  bufferSize =
    (sab.byteLength - control.byteLength) / Float32Array.BYTES_PER_ELEMENT / 2;
  leftBuffer = new Float32Array(sab, control.byteLength, bufferSize);
  rightBuffer = new Float32Array(
    sab,
    control.byteLength + leftBuffer.byteLength,
    bufferSize
  );
  fillThreshold = bufferSize / 2;

  self.postMessage({
    type: "initialized",
  });

  startWatchingBuffer();
}

function startWatchingBuffer() {
  function process() {
    consumeMessageQueue();
    handleGenerate();
    setTimeout(process);
  }

  setTimeout(process);
}

function consumeMessageQueue() {
  while (messageQueue.length > 0) {
    const data = messageQueue.shift();

    switch (data.type) {
      case "setInstrument":
        handleSetInstrument(data.instrument);
        break;

      case "keyOn":
        handleKeyOn(data.id, data.pitch);
        break;

      case "keyOff":
        handleKeyOff(data.id);
        break;

      default:
        break;
    }
  }
}

function handleSetInstrument(instrument) {
  if (!wasm) {
    self.postMessage(WASM_NOT_LOADED_MESSAGE);
    return;
  }

  wasm.setInstrument(instrument);
}

/**
 * @param {number} id
 * @param {Pitch} pitch
 */
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

function handleReset() {
  if (!wasm) {
    self.postMessage(WASM_NOT_LOADED_MESSAGE);
    return;
  }

  messageQueue.length = 0;
  wasm.reset();
}

function handleGenerate() {
  if (!control || !leftBuffer || !rightBuffer) {
    return;
  }

  const readPos = Atomics.load(control, SAB_READ_POSITION_INDEX);
  const writePos = Atomics.load(control, SAB_WRITE_POSITION_INDEX);

  // One sample is left unused to distinguish "empty" from "full"
  // when the write and read positions coincide.
  let nWritables = (readPos + bufferSize - 1 - writePos) % bufferSize;

  if (nWritables < fillThreshold) {
    const TIMEOUT_MSEC = 50;
    Atomics.wait(control, SAB_READ_POSITION_INDEX, readPos, TIMEOUT_MSEC);
    return;
  }

  let pos = writePos;
  while (nWritables > 0) {
    const chunk = Math.min(nWritables, bufferSize - pos);
    const end = pos + chunk;

    wasm.generate(
      leftBuffer.subarray(pos, end),
      rightBuffer.subarray(pos, end),
      chunk
    );

    nWritables -= chunk;
    pos = end % bufferSize;
  }

  Atomics.store(control, SAB_WRITE_POSITION_INDEX, pos);
}

self.onmessage = async ({ data }) => {
  switch (data.type) {
    case "loadWasm":
      await handleLoadWasm();
      break;

    case "initialize":
      handleInitialize(data.sampleRate, data.sab);
      break;

    case "setInstrument":
    case "keyOn":
    case "keyOff":
      messageQueue.push(data);
      break;

    case "reset":
      handleReset();
      break;

    default:
      break;
  }
};
