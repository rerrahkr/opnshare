const SAB_CONTROL_SIZE = 2;
const SAB_READ_POSITION_INDEX = 0;
const SAB_WRITE_POSITION_INDEX = 1;

/**
 * @typedef Pitch
 * @property {number} octave  - Octave number (e.g., 4 = around middle C)
 * @property {number} semitone - Index within the octave (0–11)
 */

class SynthProcessor extends AudioWorkletProcessor {
  /** @type {Int32Array | undefined} */
  control = undefined;
  /** @type {Float32Array | undefined} */
  leftBuffer = undefined;
  /** @type {Float32Array | undefined} */
  rightBuffer = undefined;
  bufferSize = 0;
  hasInitialized = false;

  constructor() {
    super();

    this.port.onmessage = async (event) => {
      const data = event.data;
      switch (data.type) {
        case "initialize":
          this.handleInitialize(data.sab);
          break;

        default:
          break;
      }
    };
  }

  /**
   * Handle initialize.
   * @param {SharedArrayBuffer} sab
   */
  handleInitialize(sab) {
    this.control = new Int32Array(sab, 0, SAB_CONTROL_SIZE);
    this.bufferSize =
      (sab.byteLength - this.control.byteLength) /
      Float32Array.BYTES_PER_ELEMENT /
      2;
    this.leftBuffer = new Float32Array(
      sab,
      this.control.byteLength,
      this.bufferSize
    );
    this.rightBuffer = new Float32Array(
      sab,
      this.control.byteLength + this.leftBuffer.byteLength,
      this.bufferSize
    );
    this.hasInitialized = true;
  }

  /**
   * Audio processing.
   * @param {Float32Array[][]} outputs
   * @returns {boolean}
   */
  process(_, outputs) {
    if (!this.hasInitialized) {
      return true;
    }

    const [leftChannel, rightChannel] = outputs[0];

    const readPos = Atomics.load(this.control, SAB_READ_POSITION_INDEX);
    const writePos = Atomics.load(this.control, SAB_WRITE_POSITION_INDEX);
    const nReadables = (writePos + this.bufferSize - readPos) % this.bufferSize;

    let nReads = Math.min(leftChannel.length, nReadables);
    if (nReads !== leftChannel.length) {
      console.warn("buffer underrun!", leftChannel.length - nReads);
    }

    let pos = readPos;
    while (nReads > 0) {
      const chunk = Math.min(nReads, this.bufferSize - pos);
      const end = pos + chunk;

      leftChannel.set(this.leftBuffer.subarray(pos, end));
      rightChannel.set(this.rightBuffer.subarray(pos, end));

      nReads -= chunk;
      pos = end % this.bufferSize;
    }

    // It is unnecessary to fill zero-samples in buffer-underrun
    // because outputs have already zero-initialed.

    Atomics.store(this.control, SAB_READ_POSITION_INDEX, pos);
    Atomics.notify(this.control, SAB_READ_POSITION_INDEX, 1);

    return true;
  }
}

registerProcessor("processor", SynthProcessor);
