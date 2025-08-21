import { config as configFmp7, parse as parseFmp7 } from "./formats/fmp7";
import type { FmInstrument } from "./types";

const formatParsers = {
  [configFmp7.type]: parseFmp7,
} as const;

export type TextFormat = keyof typeof formatParsers;
type InstrumentParser = (text: string) => FmInstrument;

export const SUPPORTED_TEXT_FORMATS = Object.keys(
  formatParsers
) as TextFormat[];

export function getInstrumentParser(format: TextFormat): InstrumentParser {
  return formatParsers[format];
}
