import type { FmInstrument, FmOperator, FmOperators } from "../../types";
import { DataCorruptionError, UnsupportedFormatError } from "../errors";

export function load(buffer: ArrayBufferLike): [FmInstrument, ""] {
  const view = new DataView(buffer);

  let csr = 0;
  const fileVersion = view.getUint8(csr++);
  if (fileVersion > 0) {
    if (fileVersion < 9) throw new DataCorruptionError();
    if (fileVersion === 9 && view.byteLength !== 51) {
      // make sure it's not for that discontinued chip
      throw new DataCorruptionError();
    }
    if (fileVersion >= 11) {
      const system = view.getUint8(csr++);
      if (system !== 2 && system !== 8) {
        // genesis and arcade only
        throw new UnsupportedFormatError();
      }
    }
    const insType = view.getUint8(csr++);
    if (insType !== 1) {
      // Fm only
      throw new UnsupportedFormatError();
    }
  } else {
    // older, unversioned dmp
    if (view.byteLength !== 49) throw new DataCorruptionError();
  }

  if (fileVersion === 9) csr++; // skip version 9's total operators field

  const pms = view.getUint8(csr++);
  const fb = view.getUint8(csr++);
  const al = view.getUint8(csr++);
  const ams = view.getUint8(csr++);
  const lfoFreq = pms && ams ? 8 : 0;

  const ops: FmOperator[] = [];
  const opIndices = [0, 2, 1, 3];
  const DT_CONV_IN = [7, 6, 5, 0, 1, 2, 3, 3];
  for (const i of opIndices) {
    const op: FmOperator = {} as FmOperator;
    op.ml = view.getUint8(csr++);
    op.tl = view.getUint8(csr++);
    op.ar = view.getUint8(csr++);
    op.dr = view.getUint8(csr++);
    op.sl = view.getUint8(csr++);
    op.rr = view.getUint8(csr++);
    op.am = view.getUint8(csr++) === 1;
    op.ks = view.getUint8(csr++);
    // mask out OPM's DT2
    const dt = DT_CONV_IN[view.getUint8(csr++) & 7];
    if (dt === undefined) {
      throw new DataCorruptionError();
    }
    op.dt = dt;
    op.sr = view.getUint8(csr++);
    op.ssgEg = view.getUint8(csr++);
    ops[i] = op;
  }

  return [
    {
      al,
      fb,
      op: [ops[0], ops[1], ops[2], ops[3]] as FmOperators,
      lfoFreq,
      pms,
      ams,
    },
    "",
  ];
}

export function save(instrument: FmInstrument): ArrayBuffer {
  const buffer = new ArrayBuffer(51);
  const view = new DataView(buffer);
  let csr = 0;

  view.setUint8(csr++, 11); // Version
  view.setUint8(csr++, 2); // System: genesis
  view.setUint8(csr++, 1); // FM

  view.setUint8(csr++, instrument.pms);
  view.setUint8(csr++, instrument.fb);
  view.setUint8(csr++, instrument.al);
  view.setUint8(csr++, instrument.ams);

  const opIndices = [0, 2, 1, 3];
  const DT_CONV_OUT = [3, 4, 5, 6, 3, 2, 1, 0];
  for (const i of opIndices) {
    const op = instrument.op[i];
    view.setUint8(csr++, op.ml);
    view.setUint8(csr++, op.tl);
    view.setUint8(csr++, op.ar);
    view.setUint8(csr++, op.dr);
    view.setUint8(csr++, op.sl);
    view.setUint8(csr++, op.rr);
    view.setUint8(csr++, op.am ? 1 : 0);
    view.setUint8(csr++, op.ks);
    view.setUint8(csr++, DT_CONV_OUT[op.dt]);
    view.setUint8(csr++, op.sr);
    view.setUint8(csr++, op.ssgEg);
  }

  return buffer;
}
