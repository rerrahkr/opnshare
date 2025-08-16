import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { FmInstrument } from "../../types";
import { load, save } from "./vgi";

describe(".vgi file handler", () => {
  it("should save and load an instrument", async () => {
    const instrument: FmInstrument = {
      al: 4,
      fb: 5,
      op: [
        {
          ar: 12,
          dr: 7,
          sr: 25,
          rr: 3,
          sl: 10,
          tl: 56,
          ks: 2,
          ml: 8,
          dt: 5,
          am: true,
          ssgEg: 9,
        },
        {
          ar: 29,
          dr: 0,
          sr: 17,
          rr: 14,
          sl: 2,
          tl: 99,
          ks: 1,
          ml: 13,
          dt: 0,
          am: false,
          ssgEg: 4,
        },
        {
          ar: 3,
          dr: 31,
          sr: 0,
          rr: 10,
          sl: 15,
          tl: 127,
          ks: 0,
          ml: 1,
          dt: 7,
          am: true,
          ssgEg: 15,
        },
        {
          ar: 25,
          dr: 19,
          sr: 12,
          rr: 7,
          sl: 0,
          tl: 80,
          ks: 3,
          ml: 15,
          dt: 2,
          am: false,
          ssgEg: 11,
        },
      ],
      // lfoFreq: 3,
      lfoFreq: 8,
      ams: 1,
      pms: 0,
    };

    const savedData = save(instrument);

    const [loadedInstrument] = await load(savedData);

    expect(loadedInstrument).toEqual(instrument);
  });

  it("should handle a .vgi file", async () => {
    const vgiPath = path.resolve(__dirname, "./test.vgi");
    const buffer = (await fs.readFile(vgiPath)).buffer;

    const expected: FmInstrument = {
      al: 6,
      fb: 2,
      // lfoFreq: 11,
      lfoFreq: 8,
      pms: 5,
      ams: 2,
      op: [
        {
          ar: 0,
          dr: 31,
          sr: 31,
          rr: 15,
          sl: 15,
          tl: 127,
          ks: 3,
          ml: 15,
          dt: 7,
          am: true,
          ssgEg: 7,
        },
        {
          ar: 31,
          dr: 11,
          sr: 25,
          rr: 7,
          sl: 5,
          tl: 84,
          ks: 1,
          ml: 13,
          // dt: 4,
          dt: 0,
          am: false,
          ssgEg: 12,
        },
        {
          ar: 7,
          dr: 18,
          sr: 0,
          rr: 7,
          sl: 10,
          tl: 32,
          ks: 2,
          ml: 5,
          dt: 5,
          am: true,
          ssgEg: 0,
        },
        {
          ar: 31,
          dr: 0,
          sr: 0,
          rr: 0,
          sl: 0,
          tl: 0,
          ks: 0,
          ml: 0,
          dt: 0,
          am: false,
          ssgEg: 0,
        },
      ],
    };

    const [loaded] = await load(buffer);
    expect(loaded).toEqual(expected);

    const saved = save(loaded);
    expect(saved).toEqual(buffer);
  });
});
