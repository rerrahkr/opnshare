import type { FmInstrument, FmOperator, FmOperators } from "../../types";
import { DataCorruptionError } from "../errors";

export function load(buffer: ArrayBufferLike): [FmInstrument, ""] {
  const view = new DataView(buffer);

  if (view.byteLength !== 42) {
    throw new DataCorruptionError("Invalid file size.");
  }

  let csr = 0;
  const al = view.getUint8(csr++);
  const fb = view.getUint8(csr++);

  const opOrder = [0, 2, 1, 3];
  const op = Array(4)
    .fill(0)
    .map(() => ({}) as FmOperator) as FmOperators;

  const DT_CONV_IN = [7, 6, 5, 0, 1, 2, 3, 3];
  for (const o of opOrder) {
    const dt = DT_CONV_IN[view.getUint8(csr + 1)];
    if (dt === undefined) {
      throw new DataCorruptionError();
    }

    op[o] = {
      ml: view.getUint8(csr),
      dt,
      tl: view.getUint8(csr + 2),
      ks: view.getUint8(csr + 3),
      ar: view.getUint8(csr + 4),
      dr: view.getUint8(csr + 5),
      sr: view.getUint8(csr + 6),
      rr: view.getUint8(csr + 7),
      sl: view.getUint8(csr + 8),
      ssgEg: view.getUint8(csr + 9),
      am: false, // Not in format
    };

    csr += 10;
  }

  const name = "";

  return [
    {
      al,
      fb,
      op,
      lfoFreq: 0, // Not in format
      ams: 0, // Not in format
      pms: 0, // Not in format
    },
    name,
  ];
}

export function save(instrument: FmInstrument): ArrayBuffer {
  const buffer = new ArrayBuffer(42);
  const view = new DataView(buffer);
  let csr = 0;

  view.setUint8(csr++, instrument.al);
  view.setUint8(csr++, instrument.fb);

  const opOrder = [0, 2, 1, 3];
  const DT_CONV_OUT = [3, 4, 5, 6, 3, 2, 1, 0];
  for (const o of opOrder) {
    const op = instrument.op[o];
    view.setUint8(csr++, op.ml);
    view.setUint8(csr++, DT_CONV_OUT[op.dt]);
    view.setUint8(csr++, op.tl);
    view.setUint8(csr++, op.ks);
    view.setUint8(csr++, op.ar);
    view.setUint8(csr++, op.dr);
    view.setUint8(csr++, op.sr);
    view.setUint8(csr++, op.rr);
    view.setUint8(csr++, op.sl);
    view.setUint8(csr++, op.ssgEg);
  }

  return buffer;
}
