import { load as loadBti } from "./formats/bti";
import { load as loadDmp } from "./formats/dmp";
import { load as loadFui } from "./formats/fui";
import { load as loadIns } from "./formats/ins";
import { load as loadTfi } from "./formats/tfi";
import { load as loadVgi } from "./formats/vgi";
import { getInstrumentLoader } from "./loader";

describe("getInstrumentLoader", () => {
  it("should get a loader", () => {
    const map = [
      ["bti", loadBti],
      ["dmp", loadDmp],
      ["fui", loadFui],
      ["ins", loadIns],
      ["tfi", loadTfi],
      ["vgi", loadVgi],
    ];

    for (const [ext, loader] of map) {
      expect(getInstrumentLoader(new File([], `test.${ext}`))).toBe(loader);
    }
  });

  it("should be failed to get a loader", () => {
    expect(() => getInstrumentLoader(new File([], "test.txt"))).toThrow();
  });
});
