import type { FileConfig } from "../types";

export const config = {
  type: "VGM Music Maker",
  extensions: [".vgi"],
  readable: true,
  writable: true,
} as const satisfies FileConfig;
