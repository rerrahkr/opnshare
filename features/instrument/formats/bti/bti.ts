import type { FmInstrument, FmOperator, FmOperators } from "../../types";
import { DataCorruptionError, UnsupportedInstrumentTypeError } from "../errors";

export function load(buffer: ArrayBufferLike): [FmInstrument, string] {
  const view = new DataView(buffer);
  const textDecoder = new TextDecoder();

  let csr = 0;
  if (textDecoder.decode(buffer.slice(csr, csr + 16)) !== "BambooTrackerIst") {
    throw new DataCorruptionError("Invalid magic string");
  }
  csr += 16;

  csr += 8; // Skip EOF offset and file version

  // Instrument section
  if (textDecoder.decode(buffer.slice(csr, csr + 8)) !== "INSTRMNT") {
    throw new DataCorruptionError("INSTRMNT chunk not found");
  }
  csr += 8;
  const instOffs = view.getUint32(csr, true);
  const instCsr = csr;
  csr += 4;
  const nameLen = view.getUint32(csr, true);
  csr += 4;
  let name = "";
  if (nameLen > 0) {
    name = textDecoder.decode(buffer.slice(csr, csr + nameLen));
    csr += nameLen;
  }

  if (view.getUint8(csr++) !== 0x00) {
    throw new UnsupportedInstrumentTypeError("only FM is supported");
  }
  csr = instCsr + instOffs;

  // Instrument property section
  if (textDecoder.decode(buffer.slice(csr, csr + 8)) !== "INSTPROP") {
    throw new DataCorruptionError("INSTPROP chunk not found");
  }
  csr += 8;
  const instPropOfs = view.getUint32(csr, true);
  const instPropEnd = csr + instPropOfs;
  csr += 4;

  const ops = Array(4)
    .fill(0)
    .map(() => ({}) as FmOperator) as FmOperators;
  const instrument: FmInstrument = {
    op: ops,
    al: 0,
    fb: 0,
    lfoFreq: 0,
    ams: 0,
    pms: 0,
  };
  for (const op of ops) {
    op.am = false;
  }

  while (csr < instPropEnd) {
    const secId = view.getUint8(csr++);
    if (secId === 0x00) {
      // FM envelope
      const offs = view.getUint8(csr);
      const propCsr = csr;
      csr += 1;
      const tmp = view.getUint8(csr++);
      instrument.al = tmp >> 4;
      instrument.fb = tmp & 0x0f;
      for (const op of ops) {
        let tmpOp = view.getUint8(csr++);
        op.ar = tmpOp & 0x1f;
        tmpOp = view.getUint8(csr++);
        op.ks = tmpOp >> 5;
        op.dr = tmpOp & 0x1f;
        tmpOp = view.getUint8(csr++);
        op.dt = tmpOp >> 5;
        op.sr = tmpOp & 0x1f;
        tmpOp = view.getUint8(csr++);
        op.sl = tmpOp >> 4;
        op.rr = tmpOp & 0x0f;
        op.tl = view.getUint8(csr++);
        tmpOp = view.getUint8(csr++);
        op.ml = tmpOp & 0x0f;
        op.ssgEg = (tmpOp >> 4) ^ 0x08;
      }
      csr = propCsr + offs;
    } else if (secId === 0x01) {
      // FM LFO
      const offs = view.getUint8(csr);
      const propCsr = csr;
      csr += 1;
      let tmpLfo = view.getUint8(csr++);
      instrument.lfoFreq = (tmpLfo >> 4) | 8;
      instrument.pms = tmpLfo & 7;
      tmpLfo = view.getUint8(csr++);
      instrument.ams = tmpLfo & 3;
      if (tmpLfo & 0x10) ops[0].am = true;
      if (tmpLfo & 0x20) ops[1].am = true;
      if (tmpLfo & 0x40) ops[2].am = true;
      if (tmpLfo & 0x80) ops[3].am = true;
      csr = propCsr + offs;
    } else {
      // Skip other sections
      const offs = view.getUint8(csr);
      csr += offs;
    }
  }

  return [instrument, name];
}

export function save(instrument: FmInstrument, name: string): ArrayBuffer {
  const textEncoder = new TextEncoder();
  const nameBytes = textEncoder.encode(name);
  const nameLen = nameBytes.length;

  const instChunkContentSize = nameLen + 20;
  const instChunkSize = instChunkContentSize + 8;

  const propChunkContentSize = 31 + (instrument.lfoFreq & 8 ? 5 : 0);
  const propChunkSize = propChunkContentSize + 8;

  const totalSize = 24 + instChunkSize + propChunkSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  let csr = 0;

  // Header
  const magic = textEncoder.encode("BambooTrackerIst");
  new Uint8Array(buffer, csr, magic.length).set(magic);
  csr += 16;
  view.setUint32(csr, totalSize - 16, true); // EOF offset
  csr += 4;
  view.setUint32(csr, 0x00010400, true); // File version v1.4.0
  csr += 4;

  // INSTRMNT chunk
  const instChunkId = textEncoder.encode("INSTRMNT");
  new Uint8Array(buffer, csr, instChunkId.length).set(instChunkId);
  csr += 8;
  view.setUint32(csr, instChunkContentSize, true);
  csr += 4;
  view.setUint32(csr, nameLen, true);
  csr += 4;
  new Uint8Array(buffer, csr, nameLen).set(nameBytes);
  csr += nameLen;
  view.setUint8(csr++, 0x00); // FM type
  view.setUint8(csr++, 0); // Envelope number
  for (let i = 0; i < 10; ++i) view.setUint8(csr++, 0x80); // Dummy data

  // INSTPROP chunk
  const propChunkId = textEncoder.encode("INSTPROP");
  new Uint8Array(buffer, csr, propChunkId.length).set(propChunkId);
  csr += 8;
  view.setUint32(csr, propChunkContentSize, true);
  csr += 4;

  // FM envelope
  view.setUint8(csr++, 0x00);
  view.setUint8(csr++, 26);
  view.setUint8(csr++, (instrument.al << 4) | instrument.fb);
  for (let o = 0; o < 4; ++o) {
    const op = instrument.op[o];
    view.setUint8(csr++, 0x20 | op.ar);
    view.setUint8(csr++, (op.ks << 5) | op.dr);
    view.setUint8(csr++, (op.dt << 5) | op.sr);
    view.setUint8(csr++, (op.sl << 4) | op.rr);
    view.setUint8(csr++, op.tl);
    view.setUint8(csr++, ((op.ssgEg ^ 8) << 4) | op.ml);
  }

  // FM LFO
  if (instrument.lfoFreq & 8) {
    view.setUint8(csr++, 0x01);
    view.setUint8(csr++, 4);
    view.setUint8(csr++, ((instrument.lfoFreq & 7) << 4) | instrument.pms);
    let am = 0;
    for (let i = 0; i < 4; i++) {
      if (instrument.op[i].am) am |= 0x10 << i;
    }
    view.setUint8(csr++, am | instrument.ams);
    view.setUint8(csr++, 0);
  }

  return buffer;
}
