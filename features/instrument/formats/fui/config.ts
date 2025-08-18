import type { FileConfig } from "../types";

export const config: FileConfig = {
  extensions: [".fui"],
  readable: true,
  writable: true,
} as const;
