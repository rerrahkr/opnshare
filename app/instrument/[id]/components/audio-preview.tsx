"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
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
import { useFmSynthesizer } from "@/contexts/synth";
import type { FmInstrument } from "@/features/instrument/types";
import { AVAILABLE_CHIP_MAP } from "@/features/preview/consts";
import { clampOctave, withinOctave } from "@/features/preview/octave";
import { type Pitch, pitchToString } from "@/features/preview/pitch";
import type { AvailableChip } from "@/features/preview/types";
import { useSynthSettings } from "@/stores/synth-settings";
import { iota } from "@/utils/range";

const DISPLAYED_OCTAVE_RANGE = 4;
const DISPLAYED_WHITE_KEY_COUNT = 7 * DISPLAYED_OCTAVE_RANGE;
const WHITE_NOTE_TABLE = [0, 2, 4, 5, 7, 9, 11] as const;
const BLACK_NOTE_NAME_MAP: ReadonlyMap<number, number> = new Map([
  [0, 1],
  [1, 3],
  [3, 6],
  [4, 8],
  [5, 10],
]);

type ActiveKey = {
  pitch: Pitch;
  keyId: string;
};

export function AudioPreview({
  instrument,
}: {
  instrument: FmInstrument;
}): React.JSX.Element {
  const { playbackChip, setPlaybackChip } = useSynthSettings();
  const [octaveOffset, setOctaveOffset] = useState<number>(3);

  // Key: pointerId, Value: ActiveNote
  const activeNotes = useRef<Map<number, ActiveKey>>(new Map());

  // For pressed button color.
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const synthContext = useFmSynthesizer();

  // Set an instrument on loading this component.
  useEffect(() => {
    synthContext?.setInstrument(instrument);
  }, [instrument, synthContext]);

  // Reset synthesizer on unmount this component and jump to the different
  // page.
  useEffect(() => {
    return () => {
      synthContext?.reset();
    };
  }, [synthContext]);

  function handlePlaybackChipValueChanged(value: string) {
    const chipType = value as AvailableChip;
    synthContext?.changeChip(chipType);
    setPlaybackChip(chipType);
  }

  async function noteOn(pitch: Pitch, pointerId: number) {
    await synthContext?.keyOn(pitch, pointerId);
  }

  async function noteOff(pointerId: number) {
    synthContext?.keyOff(pointerId);
  }

  async function handlePointerDown(
    e: React.PointerEvent<HTMLButtonElement>,
    pitch: Pitch,
    keyId: string
  ) {
    if (e.pointerType === "mouse" && e.button !== 0) {
      // Ignore mouse buttons other than the left button.
      return;
    }

    activeNotes.current.set(e.pointerId, { pitch, keyId });
    setPressedKeys((prev) => new Set(prev).add(keyId));
    await noteOn(pitch, e.pointerId);
  }

  async function handlePointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    const active = activeNotes.current.get(e.pointerId);
    if (active) {
      await noteOff(e.pointerId);
      activeNotes.current.delete(e.pointerId);
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(active.keyId);
        return next;
      });
    }
  }

  async function handlePointerEnter(
    e: React.PointerEvent<HTMLButtonElement>,
    pitch: Pitch,
    keyId: string
  ) {
    const active = activeNotes.current.get(e.pointerId);
    if (active) {
      if (
        active.pitch.octave === pitch.octave &&
        active.pitch.semitone === pitch.semitone
      ) {
        return;
      }

      // Note off previous pressed note.
      await noteOff(e.pointerId);
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(active.keyId);
        next.add(keyId);
        return next;
      });

      // Note on new one.
      activeNotes.current.set(e.pointerId, {
        pitch,
        keyId,
      });
      await noteOn(pitch, e.pointerId);
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
                onValueChange={handlePlaybackChipValueChanged}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    ...AVAILABLE_CHIP_MAP.keys().map((chip) => (
                      <SelectItem key={chip} value={chip}>
                        {chip}
                      </SelectItem>
                    )),
                  ]}
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
                    const relativeOctave = Math.floor(i / 7);
                    const octave = relativeOctave + octaveOffset;
                    const semitone = WHITE_NOTE_TABLE[whiteKeyIndex];
                    const pitch: Pitch = { octave, semitone };
                    const pitchName = pitchToString(pitch);
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
                          handlePointerDown(e, pitch, pitchName)
                        }
                        onPointerUp={handlePointerUp}
                        onPointerEnter={(e) =>
                          handlePointerEnter(e, pitch, pitchName)
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
                    const semitone = BLACK_NOTE_NAME_MAP.get(whiteKeyIndex);
                    if (!semitone) {
                      return <div key={`spacer-${i}`} className="w-6" />;
                    }

                    const relativeOctave = Math.floor(i / 7);
                    const octave = relativeOctave + octaveOffset;
                    const pitch: Pitch = { octave, semitone };
                    const pitchName = pitchToString(pitch);
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
                          handlePointerDown(e, pitch, pitchName)
                        }
                        onPointerUp={handlePointerUp}
                        onPointerEnter={(e) =>
                          handlePointerEnter(e, pitch, pitchName)
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
