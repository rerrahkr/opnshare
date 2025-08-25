import type { FileConfig } from "../types";

export const config = {
  type: "BambooTracker",
  extensions: [".bti"],
  readable: true,
  writable: true,
} as const satisfies FileConfig;
