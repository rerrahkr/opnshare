import type { FileConfig } from "../types";

export const config: FileConfig = {
  extensions: [".dmp"],
  readable: true,
  writable: true,
} as const;
