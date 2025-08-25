"use client";

import type React from "react";
import { useState } from "react";
import { FaVolumeUp } from "react-icons/fa";
import { Label } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AudioPreview(): React.JSX.Element {
  const [playbackChip, setPlaybackChip] = useState("OPL3");
  const [octaveOffset, setOctaveOffset] = useState<number>(0);

  const chips = ["OPL3", "OPN2", "OPM", "OPL2"];

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
              <Select value={playbackChip} onValueChange={setPlaybackChip}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chips.map((chip) => (
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
                onClick={() => setOctaveOffset(Math.max(-1, octaveOffset - 1))}
                disabled={octaveOffset <= -1}
              >
                ←
              </Button>
              <span className="text-sm font-mono w-8 text-center">
                {octaveOffset >= 0 ? `+${octaveOffset}` : octaveOffset}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOctaveOffset(Math.min(8, octaveOffset + 1))}
                disabled={octaveOffset >= 8}
              >
                →
              </Button>
            </div>
          </div>

          {/* Piano Keyboard - 4 octaves */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex justify-center">
              <div className="relative">
                {/* White keys */}
                <div className="flex">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const whiteKeyIndex = i % 7;
                    const octave = Math.floor(i / 7);
                    const notes = ["C", "D", "E", "F", "G", "A", "B"];
                    const note = notes[whiteKeyIndex];
                    const actualOctave = octave + 2 + octaveOffset;
                    return (
                      <button
                        key={i}
                        className="bg-white border border-gray-300 w-6 h-16 hover:bg-gray-100 transition-colors relative"
                        onClick={() => {
                          /* Play note */
                        }}
                      >
                        <span className="text-xs text-gray-600 absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          {note}
                          {actualOctave}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {/* Black keys */}
                <div className="absolute top-0 flex">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const whiteKeyIndex = i % 7;
                    const octave = Math.floor(i / 7);
                    if ([0, 1, 3, 4, 5].includes(whiteKeyIndex)) {
                      const blackNotes = ["C#", "D#", "", "F#", "G#", "A#"];
                      const blackNote = blackNotes[whiteKeyIndex];
                      const actualOctave = octave + 2 + octaveOffset;
                      return (
                        <button
                          key={`black-${i}`}
                          className="bg-gray-800 w-4 h-10 hover:bg-gray-700 transition-colors relative -ml-2 z-10"
                          style={{ marginLeft: i === 0 ? "16px" : "8px" }}
                          onClick={() => {
                            /* Play black note */
                          }}
                        >
                          <span className="text-xs text-white absolute bottom-1 left-1/2 transform -translate-x-1/2">
                            {blackNote}
                            {actualOctave}
                          </span>
                        </button>
                      );
                    } else {
                      return <div key={`spacer-${i}`} className="w-6" />;
                    }
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
