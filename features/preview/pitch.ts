export type Pitch = {
  octave: number;
  semitone: number;
};

const KEY_NAME = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "Bb",
  "B",
] as const;

export function pitchToString(pitch: Pitch): string {
  return `${KEY_NAME[pitch.semitone]}${pitch.octave}`;
}
