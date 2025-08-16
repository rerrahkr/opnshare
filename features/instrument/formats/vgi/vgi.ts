import type { FmInstrument, FmOperator, FmOperators } from "../../types";
import { DataCorruptionError } from "../errors";

export function load(buffer: ArrayBufferLike): [FmInstrument, ""] {
  const view = new DataView(buffer);

  if (view.byteLength !== 43) {
    throw new DataCorruptionError("Invalid file size.");
  }

  let csr = 0;
  const al = view.getUint8(csr++);
  const fb = view.getUint8(csr++);
  const lfoTmp = view.getUint8(csr++);
  const pms = lfoTmp & 7;
  const ams = (lfoTmp >> 4) & 3;
  const lfoFreq = lfoTmp ? 8 : 0;

  const op = Array(4)
    .fill(0)
    .map(() => ({}) as FmOperator) as FmOperators;

  const opOrder = [0, 2, 1, 3];
  const DT_CONV_IN = [7, 6, 5, 0, 1, 2, 3, 3];

  for (const o of opOrder) {
    const ml = view.getUint8(csr++);
    const dt = DT_CONV_IN[view.getUint8(csr++)];
    if (dt === undefined) {
      throw new DataCorruptionError();
    }
    const tl = view.getUint8(csr++);
    const ks = view.getUint8(csr++);
    const ar = view.getUint8(csr++);
    const drAmTmp = view.getUint8(csr++);
    const dr = drAmTmp & 31;
    const am = drAmTmp >> 7 === 1;
    const sr = view.getUint8(csr++);
    const rr = view.getUint8(csr++);
    const sl = view.getUint8(csr++);
    const ssgEg = view.getUint8(csr++);
    op[o] = {
      ar,
      dr,
      sr,
      rr,
      sl,
      tl,
      ks,
      dt,
      ml,
      am,
      ssgEg,
    } satisfies FmOperator;
  }

  return [
    {
      al,
      fb,
      op,
      lfoFreq,
      ams,
      pms,
    },
    "",
  ];
}

export function save(instrument: FmInstrument): ArrayBuffer {
  const buffer = new ArrayBuffer(43);
  const view = new DataView(buffer);
  let csr = 0;

  view.setUint8(csr++, instrument.al);
  view.setUint8(csr++, instrument.fb);
  view.setUint8(csr++, (instrument.ams << 4) | instrument.pms);

  const opOrder = [0, 2, 1, 3];
  const DT_CONV_OUT = [3, 4, 5, 6, 3, 2, 1, 0];

  for (const o of opOrder) {
    const op = instrument.op[o];
    view.setUint8(csr++, op.ml);
    view.setUint8(csr++, DT_CONV_OUT[op.dt]);
    view.setUint8(csr++, op.tl);
    view.setUint8(csr++, op.ks);
    view.setUint8(csr++, op.ar);
    view.setUint8(csr++, (op.am ? 1 << 7 : 0) | op.dr);
    view.setUint8(csr++, op.sr);
    view.setUint8(csr++, op.rr);
    view.setUint8(csr++, op.sl);
    view.setUint8(csr++, op.ssgEg);
  }

  return buffer;
}
