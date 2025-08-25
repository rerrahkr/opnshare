import type { FileConfig } from "../types";

export const config = {
  type: "MVSTracker",
  extensions: [".ins"],
  readable: true,
  writable: true,
} as const satisfies FileConfig;
