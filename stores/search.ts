import { create } from "zustand";

export type ViewMode = "grid" | "list";

interface SearchStore {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  viewMode: "grid",
  setViewMode: (mode) => set({ viewMode: mode }),
}));
