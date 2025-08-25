import { getInstrumentExporter } from "./exporter";
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

describe("getInstrumentExporter", () => {
  it("should get an exporter", () => {
    const filePairs = [
      [configBti.type, saveBti],
      [configDmp.type, saveDmp],
      [configFui.type, saveFui],
      [configIns.type, saveIns],
      [configTfi.type, saveTfi],
      [configVgi.type, saveVgi],
    ] as const;

    for (const [format, exporter] of filePairs) {
      expect(getInstrumentExporter(format)).toEqual({ type: "file", exporter });
    }

    const textPairs = [
      [configFmp.type, stringifyFmp],
      [configFmp7.type, stringifyFmp7],
      [configMucom88.type, stringifyMucom88],
      [configPmd.type, stringifyPmd],
    ] as const;

    for (const [format, exporter] of textPairs) {
      expect(getInstrumentExporter(format)).toEqual({ type: "text", exporter });
    }
  });
});
