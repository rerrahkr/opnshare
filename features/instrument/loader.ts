import { getFileExtension } from "./file";
import { config as configBti, load as loadBti } from "./formats/bti";
import { config as configDmp, load as loadDmp } from "./formats/dmp";
import { config as configFui, load as loadFui } from "./formats/fui";
import { config as configIns, load as loadIns } from "./formats/ins";
import { config as configTfi, load as loadTfi } from "./formats/tfi";
import { config as configVgi, load as loadVgi } from "./formats/vgi";
import type { FmInstrument } from "./types";

const formatLoaders = [
  { config: configBti, loader: loadBti },
  { config: configDmp, loader: loadDmp },
  { config: configFui, loader: loadFui },
  { config: configIns, loader: loadIns },
  { config: configTfi, loader: loadTfi },
  { config: configVgi, loader: loadVgi },
] as const;

export const READABLE_FILE_EXTENSIONS: readonly string[] =
  formatLoaders.flatMap((pair) => pair.config.extensions);

type InstrumentLoader = (buffer: ArrayBufferLike) => [FmInstrument, string];

export function getInstrumentLoader(file: File): InstrumentLoader {
  const ext = getFileExtension(file).toLowerCase();
  const format = formatLoaders.find((f) => f.config.extensions.includes(ext));

  if (!format) {
    throw new Error("Not loadable file");
  }

  return format.loader;
}
