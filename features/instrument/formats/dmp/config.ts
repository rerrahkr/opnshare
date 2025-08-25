import type { FileConfig } from "../types";

export const config = {
  type: "DefleMask",
  extensions: [".dmp"],
  readable: true,
  writable: true,
} as const satisfies FileConfig;
