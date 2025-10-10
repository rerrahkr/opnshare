const MAX_VOICES = 8;

/**
 * @typedef Pitch
 * @property {number} octave  - Octave number (e.g., 4 = around middle C)
 * @property {number} semitone - Index within the octave (0–11)
 */

/**
 * Convert Pitch (octave + semitone) to frequency in Hz.
 * Base reference is A4 = 440 Hz.
 *
 * @param {Pitch} pitch
 * @returns {number} Frequency in Hz
 */
function pitchToFreq(pitch) {
  // Calculate semitone offset from A4.
  // Example: A4 is octave=4, semitone=9 (if semitone=0= C, 9= A).
  const semitoneFromA4 = (pitch.octave - 4) * 12 + (pitch.semitone - 9);
  return 440 * 2 ** (semitoneFromA4 / 12);
}

class SineProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [];
  }

  constructor() {
    super();

    /**
     * Active voices.
     * @type {{ id: number, pitch: Pitch, phase: number }[]}
     */
    this.voices = [];

    this.port.onmessage = async (event) => {
      const data = event.data;
      switch (data.type) {
        case "keyOn":
          this.handleKeyOn(data.id, data.pitch);
          break;

        case "keyOff":
          this.handleKeyOff(data.id);
          break;

        default:
          break;
      }
    };
  }

  /**
   * Handle note-on message.
   * @param {number} id
   * @param {Pitch} pitch
   */
  handleKeyOn(id, pitch) {
    const existingIndex = this.voices.findIndex((v) => v.id === id);
    if (existingIndex !== -1) {
      // If the ID is already on, remove and re-register.
      this.voices.splice(existingIndex, 1);
    }

    // Remove the oldest if exceeding max voices.
    if (this.voices.length >= MAX_VOICES) {
      this.voices.shift();
    }

    this.voices.push({
      id,
      pitch,
      phase: 0,
    });
  }

  /**
   * Handle note-off message.
   * @param {number} id
   */
  handleKeyOff(id) {
    const idx = this.voices.findIndex((v) => v.id === id);
    if (idx !== -1) {
      this.voices.splice(idx, 1);
    }
  }

  /**
   * Audio processing.
   * @param {Float32Array[][]} outputs
   * @returns {boolean}
   */
  process(_, outputs) {
    const output = outputs[0];
    const channel = output[0];

    for (let i = 0; i < channel.length; i++) {
      let sampleValue = 0;

      for (const voice of this.voices) {
        // Convert pitch to frequency on the fly.
        const freq = pitchToFreq(voice.pitch);

        sampleValue += Math.sin(voice.phase);

        voice.phase +=
          (2 * Math.PI * freq) / /** @type {number} */ (sampleRate);
        if (voice.phase > 2 * Math.PI) {
          voice.phase -= 2 * Math.PI;
        }
      }

      // volume scale.
      channel[i] = sampleValue * 0.2;
    }

    return true;
  }
}

registerProcessor("processor", SineProcessor);
