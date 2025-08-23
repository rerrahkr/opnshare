import { config as configFmp, parse as parseFmp } from "./formats/fmp";
import { config as configFmp7, parse as parseFmp7 } from "./formats/fmp7";
import {
  config as configMucom88,
  parse as parseMucom88,
} from "./formats/mucom88";
import { config as configPmd, parse as parsePmd } from "./formats/pmd";
import { getInstrumentParser } from "./parser";

describe("getInstrumentParser", () => {
  it("should get a parser", () => {
    const pairs = [
      [configFmp7.type, parseFmp7],
      [configFmp.type, parseFmp],
      [configPmd.type, parsePmd],
      [configMucom88.type, parseMucom88],
    ] as const;

    for (const [format, parser] of pairs) {
      expect(getInstrumentParser(format)).toBe(parser);
    }
  });
});
