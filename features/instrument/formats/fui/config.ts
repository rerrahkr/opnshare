import type { FileConfig } from "../types";

export const config = {
  type: "Furnace",
  extensions: [".fui"],
  readable: true,
  writable: true,
} as const satisfies FileConfig;
