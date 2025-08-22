import type { FmInstrument } from "../../types";
import { parse } from "./parser";

describe("FMP parse", () => {
  it("should parse text", () => {
    const instrument: FmInstrument = {
      al: 4,
      fb: 5,
      op: [
        {
          ar: 31,
          dr: 8,
          sr: 0,
          rr: 7,
          sl: 12,
          tl: 20,
          ks: 0,
          ml: 2,
          dt: 7,
          am: false,
          ssgEg: 0,
        },
        {
          ar: 31,
          dr: 5,
          sr: 2,
          rr: 7,
          sl: 6,
          tl: 4,
          ks: 0,
          ml: 2,
          dt: 3,
          am: false,
          ssgEg: 0,
        },
        {
          ar: 31,
          dr: 7,
          sr: 4,
          rr: 7,
          sl: 10,
          tl: 18,
          ks: 0,
          ml: 2,
          dt: 3,
          am: false,
          ssgEg: 0,
        },
        {
          ar: 31,
          dr: 0,
          sr: 4,
          rr: 7,
          sl: 0,
          tl: 0,
          ks: 0,
          ml: 2,
          dt: 0,
          am: false,
          ssgEg: 0,
        },
      ],
      lfoFreq: 0,
      ams: 0,
      pms: 0,
    };

    const text = `'@  0 ; dummy
   AR DR SR RR SL TL KS ML DT
'@ 31, 8, 0, 7,12,20, 0, 2, 7
'@ 31,5,2,7,6,4,0,2,3 ;comment
'@ 31,7, 4,7,10,18,0,2,3
'@ 31,0,4,7,0,0, 0,2,0
'@ 4,5`;

    expect(parse(text)).toEqual(instrument);
  });
});
