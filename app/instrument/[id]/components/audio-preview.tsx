"use client";

import type React from "react";
import { useRef, useState } from "react";
import { FaVolumeUp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_CHIPS } from "@/features/preview/consts";
import { clampOctave, withinOctave } from "@/features/preview/octave";
import type { AvailableChip } from "@/features/preview/types";
import { iota } from "@/utils/range";

const DISPLAYED_OCTAVE_RANGE = 4;
const DISPLAYED_WHITE_KEY_COUNT = 7 * DISPLAYED_OCTAVE_RANGE;
const WHITE_NOTE_TABLE = [
  ["C", 0],
  ["D", 2],
  ["E", 4],
  ["F", 5],
  ["G", 7],
  ["A", 9],
  ["B", 11],
] as const;
const BLACK_NOTE_NAME_MAP: ReadonlyMap<number, [string, number]> = new Map([
  [0, ["C#", 1]],
  [1, ["Eb", 3]],
  [3, ["F#", 6]],
  [4, ["G#", 8]],
  [5, ["Bb", 10]],
]);

type ActiveNote = {
  octave: number;
  indexInOctave: number;
  keyId: string;
};

export function AudioPreview(): React.JSX.Element {
  const [playbackChip, setPlaybackChip] = useState<AvailableChip>("OPN");
  const [octaveOffset, setOctaveOffset] = useState<number>(3);

  // Key: pointerId, Value: ActiveNote
  const activeNotes = useRef<Map<number, ActiveNote>>(new Map());

  // For pressed button color.
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  function handlePointerDown(
    e: React.PointerEvent<HTMLButtonElement>,
    octave: number,
    indexInOctave: number,
    keyId: string
  ) {
    if (e.pointerType === "mouse" && e.button !== 0) {
      // Ignore mouse buttons other than the left button.
      return;
    }

    activeNotes.current.set(e.pointerId, { octave, indexInOctave, keyId });
    setPressedKeys((prev) => new Set(prev).add(keyId));
    noteOn(octave, indexInOctave, e.pointerId);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    const active = activeNotes.current.get(e.pointerId);
    if (active) {
      noteOff(active.octave, active.indexInOctave, e.pointerId);
      activeNotes.current.delete(e.pointerId);
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(active.keyId);
        return next;
      });
    }
  }

  function handlePointerEnter(
    e: React.PointerEvent<HTMLButtonElement>,
    octave: number,
    indexInOctave: number,
    keyId: string
  ) {
    const active = activeNotes.current.get(e.pointerId);
    if (active) {
      if (active.indexInOctave === indexInOctave && active.octave === octave) {
        return;
      }

      // Note off previous pressed note.
      noteOff(active.octave, active.indexInOctave, e.pointerId);
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(active.keyId);
        next.add(keyId);
        return next;
      });

      // Note on new one.
      activeNotes.current.set(e.pointerId, {
        octave,
        indexInOctave: indexInOctave,
        keyId,
      });
      noteOn(octave, indexInOctave, e.pointerId);
    }
  }

  function handlePointerLeave(
    _e: React.PointerEvent<HTMLButtonElement>,
    keyId: string
  ) {
    // Only change button color and keep activeNotes.
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.delete(keyId);
      return next;
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FaVolumeUp className="h-5 w-5" />
          Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Chip:</Label>
              <Select
                value={playbackChip}
                onValueChange={(chip) => setPlaybackChip(chip as AvailableChip)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_CHIPS.map((chip) => (
                    <SelectItem key={chip} value={chip}>
                      {chip}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Octave:</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOctaveOffset((prev) => clampOctave(prev - 1))}
                disabled={!withinOctave(octaveOffset)}
              >
                ←
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setOctaveOffset(
                    (prev) =>
                      clampOctave(prev + DISPLAYED_OCTAVE_RANGE) -
                      DISPLAYED_OCTAVE_RANGE +
                      1
                  )
                }
                disabled={!withinOctave(octaveOffset)}
              >
                →
              </Button>
            </div>
          </div>

          {/* Piano Keyboard */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex justify-center">
              <div className="relative">
                {/* White keys */}
                <div className="flex">
                  {[...iota(DISPLAYED_WHITE_KEY_COUNT)].map((i) => {
                    const whiteKeyIndex = i % 7;
                    const octave = Math.floor(i / 7);
                    const actualOctave = octave + octaveOffset;
                    const [noteName, noteNumber] =
                      WHITE_NOTE_TABLE[whiteKeyIndex];
                    const pitchName = `${noteName}${actualOctave}`;
                    const isPressed = pressedKeys.has(pitchName);

                    return (
                      <button
                        key={pitchName}
                        type="button"
                        className={`w-6 h-16 border border-gray-300 relative transition-colors ${
                          isPressed
                            ? "bg-blue-300"
                            : "bg-white hover:bg-gray-100"
                        }`}
                        onPointerDown={(e) =>
                          handlePointerDown(
                            e,
                            actualOctave,
                            noteNumber,
                            pitchName
                          )
                        }
                        onPointerUp={handlePointerUp}
                        onPointerEnter={(e) =>
                          handlePointerEnter(
                            e,
                            actualOctave,
                            noteNumber,
                            pitchName
                          )
                        }
                        onPointerLeave={(e) => handlePointerLeave(e, pitchName)}
                      >
                        <span className="text-xs text-gray-600 select-none absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          {pitchName}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Black keys */}
                <div className="absolute top-0 flex">
                  {[...iota(DISPLAYED_WHITE_KEY_COUNT)].map((i) => {
                    const whiteKeyIndex = i % 7;
                    const pair = BLACK_NOTE_NAME_MAP.get(whiteKeyIndex);
                    if (!pair) {
                      return <div key={`spacer-${i}`} className="w-6" />;
                    }

                    const [noteName, noteNumber] = pair;
                    const octave = Math.floor(i / 7);
                    const actualOctave = octave + octaveOffset;
                    const pitchName = `${noteName}${actualOctave}`;
                    const isPressed = pressedKeys.has(pitchName);

                    return (
                      <button
                        key={pitchName}
                        type="button"
                        className={`w-4 h-10 relative -ml-2 z-10 transition-colors ${
                          isPressed
                            ? "bg-blue-600"
                            : "bg-gray-800 hover:bg-gray-700"
                        }`}
                        style={{ marginLeft: i === 0 ? "16px" : "8px" }}
                        onPointerDown={(e) =>
                          handlePointerDown(
                            e,
                            actualOctave,
                            noteNumber,
                            pitchName
                          )
                        }
                        onPointerUp={handlePointerUp}
                        onPointerEnter={(e) =>
                          handlePointerEnter(
                            e,
                            actualOctave,
                            noteNumber,
                            pitchName
                          )
                        }
                        onPointerLeave={(e) => handlePointerLeave(e, pitchName)}
                      >
                        <span className="text-xs text-white select-none absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          {pitchName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function noteOn(octave: number, noteInOctave: number, pointerId: number) {
  // TODO: Control note-on in AudioWorklet.
  console.log(`Note On: ${octave}-${noteInOctave}, pointer=${pointerId}`);
}

function noteOff(octave: number, noteInOctave: number, pointerId: number) {
  // TODO: Control note-off in AudioWorklet.
  console.log(`Note Off: ${octave}-${noteInOctave}, pointer=${pointerId}`);
}
