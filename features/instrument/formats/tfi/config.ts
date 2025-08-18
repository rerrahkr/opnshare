import type { FileConfig } from "../types";

export const config: FileConfig = {
  extensions: [".tfi"],
  readable: true,
  writable: true,
} as const;
