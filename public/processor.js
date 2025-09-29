const defaultGain = 0.8;
const squareBaseAmplitude = 0.3;

const pitchToHz: { [K in Pitch]: number } = {
  C: 261.626,
  "C#": 277.183,
  D: 293.665,
  Eb: 311.127,
  E: 329.628,
  F: 349.228,
  "F#": 369.994,
  G: 391.995,
  "G#": 415.305,
  A: 440.0,
  Bb: 466.164,
  B: 493.883,
};

type SquareInfo = Readonly<{
  pitch: Pitch | undefined;
  period: number;
  halfPeriod: number;
}>;

function SquareInfo(pitch: Pitch | undefined): SquareInfo {
  if (!pitch) {
    return {
      pitch: undefined,
      period: Number.POSITIVE_INFINITY,
      halfPeriod: Number.POSITIVE_INFINITY,
    } as const;
  }

  // Calculate period by sample rate and hz.
  // sampleRate is a variable in AudioWorkletGlobalScope.
  const period = sampleRate / pitchToHz[pitch];
  return {
    pitch,
    period,
    halfPeriod: period / 2,
  } as const;
}


class FmSynthProcessor extends AudioWorkletProcessor {
  squareInfo = SquareInfo(undefined);

  set pitch(value: Pitch | undefined) {
    this.squareInfo = SquareInfo(value);
  }

  get pitch() {
    return this.squareInfo.pitch;
  }
  get period() {
    return this.squareInfo.period;
  }
  get halfPeriod() {
    return this.squareInfo.halfPeriod;
  }

  currentPos = 0;

  constructor() {
    super();

    // Receive key-on and -off messages from main thread through message port.
    this.port.onmessage = (e) => {
      switch (e.data.type) {
        case "keyOn":
          this.pitch = e.data.pitch;
          break;

        case "keyOff":
          if (this.pitch === e.data.pitch) {
            this.pitch = undefined;
          }
          break;

        default:
          break;
      }
    };
  }

  process(
    _inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<AudioParamName, Float32Array>
  ): boolean {
    // Skip sample generation in key-off.
    if (!this.pitch) {
      return true;
    }

    // We only use the first output.
    const channel = outputs[0][0];

    // Prepare gain effect.
    // A parameter can have only one value even if it is "a-rate" parameter,
    // so we need to check its length before using it.
    const gainSequence =
      parameters.gain.length === 1
        ? new Float32Array(channel.length).fill(
            parameters.gain[0] / defaultGain
          )
        : parameters.gain.map((value) => value / defaultGain);

    // Store samples.
    for (let i = 0; i < channel.length; i++) {
      this.currentPos = (this.currentPos + 1) % this.period;
      const sample =
        this.currentPos < this.halfPeriod
          ? squareBaseAmplitude
          : -squareBaseAmplitude;
      channel[i] = sample * gainSequence[i];
    }

    // Copy samples to other channels.
    for (let i = 1; i < outputs[0].length; i++) {
      outputs[0][i] = new Float32Array(channel);
    }

    return true;
  }
}

registerProcessor("fm-synth-processor", FmSynthProcessor);
