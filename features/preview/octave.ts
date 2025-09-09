// TODO: check range
export const OCTAVE_RANGE = { MIN: 0, MAX: 8 } as const;

export function clampOctave(value: number): number {
  return Math.min(OCTAVE_RANGE.MAX, Math.max(OCTAVE_RANGE.MIN, value));
}

export function withinOctave(value: number): boolean {
  return value >= OCTAVE_RANGE.MIN && value <= OCTAVE_RANGE.MAX;
}
