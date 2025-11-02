import { create } from "zustand";
import type { AvailableChip } from "@/features/preview/types";

type SynthSettings = {
  playbackChip: AvailableChip;
  setPlaybackChip: (chip: AvailableChip) => void;
};

export const useSynthSettings = create<SynthSettings>((set) => ({
  playbackChip: "OPNA",
  setPlaybackChip: (chip) => set({ playbackChip: chip }),
}));
