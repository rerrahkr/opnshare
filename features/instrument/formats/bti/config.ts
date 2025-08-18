import type { FileConfig } from "../types";

export const config: FileConfig = {
  extensions: [".bti"],
  readable: true,
  writable: true,
} as const;
