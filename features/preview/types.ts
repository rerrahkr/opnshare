import type { RecommendedChip } from "../instrument/models";

type Subset<T, U extends T> = U;

export type AvailableChip = Subset<RecommendedChip, "OPNA" | "OPN2">;
