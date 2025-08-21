import { config as configFmp7, parse as parseFmp7 } from "./formats/fmp7";
import { getInstrumentParser } from "./parser";

describe("getInstrumentParser", () => {
  it("should get a parser", () => {
    const pairs = [[configFmp7.type, parseFmp7]];

    for (const [format, parser] of pairs) {
      expect(getInstrumentParser(format)).toBe(parser);
    }
  });
});
