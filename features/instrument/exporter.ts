import { config as configBti, save as saveBti } from "./formats/bti";
import { config as configDmp, save as saveDmp } from "./formats/dmp";
import { config as configFmp, stringify as stringifyFmp } from "./formats/fmp";
import {
  config as configFmp7,
  stringify as stringifyFmp7,
} from "./formats/fmp7";
import { config as configFui, save as saveFui } from "./formats/fui";
import { config as configIns, save as saveIns } from "./formats/ins";
import {
  config as configMucom88,
  stringify as stringifyMucom88,
} from "./formats/mucom88";
import { config as configPmd, stringify as stringifyPmd } from "./formats/pmd";
import { config as configTfi, save as saveTfi } from "./formats/tfi";
import { config as configVgi, save as saveVgi } from "./formats/vgi";
import type { FmInstrument } from "./types";

type InstrumentExporter =
  | {
      exporter: (instrument: FmInstrument, name: string) => ArrayBuffer;
      type: "file";
    }
  | {
      exporter: (instrument: FmInstrument) => string;
      type: "text";
    };

const EXPORTERS = {
  [configBti.type]: { exporter: saveBti, type: "file" },
  [configDmp.type]: { exporter: saveDmp, type: "file" },
  [configFmp.type]: { exporter: stringifyFmp, type: "text" },
  [configFmp7.type]: { exporter: stringifyFmp7, type: "text" },
  [configFui.type]: { exporter: saveFui, type: "file" },
  [configMucom88.type]: { exporter: stringifyMucom88, type: "text" },
  [configIns.type]: { exporter: saveIns, type: "file" },
  [configPmd.type]: { exporter: stringifyPmd, type: "text" },
  [configTfi.type]: { exporter: saveTfi, type: "file" },
  [configVgi.type]: { exporter: saveVgi, type: "file" },
} as const satisfies {
  [key: string]: InstrumentExporter;
};

export type ExportableFormat = keyof typeof EXPORTERS;

export const EXPORTABLE_FORMATS = Object.keys(EXPORTERS) as ExportableFormat[];

export function getInstrumentExporter(
  format: ExportableFormat
): InstrumentExporter {
  return EXPORTERS[format];
}
