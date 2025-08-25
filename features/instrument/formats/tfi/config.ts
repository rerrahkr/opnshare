import type { FileConfig } from "../types";

export const config = {
  type: "TFM Music Maker",
  extensions: [".tfi"],
  readable: true,
  writable: true,
} as const satisfies FileConfig;
