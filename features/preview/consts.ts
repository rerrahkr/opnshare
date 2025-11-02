import type { AvailableChip } from "./types";

/**
 * Map of available sound chips and their corresponding values.
 * The values must match the ones defined in WASM.
 */
export const AVAILABLE_CHIP_MAP: ReadonlyMap<AvailableChip, number> = new Map<
  AvailableChip,
  number
>([
  ["OPNA", 0],
  ["OPN2", 1],
]);
