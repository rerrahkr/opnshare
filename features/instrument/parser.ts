import { config as configFmp, parse as parseFmp } from "./formats/fmp";
import { config as configFmp7, parse as parseFmp7 } from "./formats/fmp7";
import {
  config as configMucom88,
  parse as parseMucom88,
} from "./formats/mucom88";
import { config as configPmd, parse as parsePmd } from "./formats/pmd";
import type { FmInstrument } from "./types";

const FORMAT_PARSERS = {
  [configFmp.type]: parseFmp,
  [configFmp7.type]: parseFmp7,
  [configMucom88.type]: parseMucom88,
  [configPmd.type]: parsePmd,
} as const;

export type TextFormat = keyof typeof FORMAT_PARSERS;
type InstrumentParser = (text: string) => FmInstrument;

export const SUPPORTED_TEXT_FORMATS = Object.keys(
  FORMAT_PARSERS
) as TextFormat[];

export function getInstrumentParser(format: TextFormat): InstrumentParser {
  return FORMAT_PARSERS[format];
}
