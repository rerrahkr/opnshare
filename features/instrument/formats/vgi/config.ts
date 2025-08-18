import type { FileConfig } from "../types";

export const config: FileConfig = {
  extensions: [".vgi"],
  readable: true,
  writable: true,
} as const;
