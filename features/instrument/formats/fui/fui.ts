import type { FmInstrument, FmOperator, FmOperators } from "../../types";
import { DataCorruptionError, UnsupportedInstrumentTypeError } from "../errors";
import { readNullTerminatedString } from "../utils";

function loadOldFormat(view: DataView): [FmInstrument, string] {
  if (view.byteLength < 24) throw new DataCorruptionError();

  let csr = 20;
  const pointer = view.getUint32(csr, true);
  if (view.byteLength < pointer + 8) throw new DataCorruptionError();
  csr = pointer;

  if (
    new TextDecoder().decode(
      view.buffer.slice(view.byteOffset + csr, view.byteOffset + csr + 4)
    ) !== "INST"
  ) {
    throw new DataCorruptionError();
  }
  csr += 4;
  const blockSize = view.getUint32(csr, true);
  csr += 4;
  if (view.byteLength < csr + blockSize) throw new DataCorruptionError();

  csr += 2; // Skip instVersion
  const instType = view.getUint8(csr++);
  if (instType !== 1) throw new UnsupportedInstrumentTypeError();
  csr++;

  const { text: name, length: nameLen } = readNullTerminatedString(view, csr);
  csr += nameLen;

  const al = view.getUint8(csr++);
  const fb = view.getUint8(csr++);
  const pms = view.getUint8(csr++);
  const ams = view.getUint8(csr++);
  csr += 4;

  const opOrder = [0, 2, 1, 3];
  const op = Array(4)
    .fill(0)
    .map(() => ({}) as FmOperator) as FmOperators;

  for (const o of opOrder) {
    const am = view.getUint8(csr++) === 1;
    const ar = view.getUint8(csr++);
    const dr = view.getUint8(csr++);
    const ml = view.getUint8(csr++);
    const rr = view.getUint8(csr++);
    const sl = view.getUint8(csr++);
    const tl = view.getUint8(csr++);
    csr++; // Skip
    const ks = view.getUint8(csr++);
    const dt = view.getUint8(csr++);
    const sr = view.getUint8(csr++);
    const ssgEg = view.getUint8(csr++);

    op[o] = {
      ar,
      dr,
      sr,
      rr,
      sl,
      tl,
      ks,
      ml,
      dt,
      am,
      ssgEg,
    } satisfies FmOperator;

    csr += 20;
  }

  return [{ al, fb, pms, ams, op, lfoFreq: 0 }, name];
}

function loadNewFormat(view: DataView): [FmInstrument, string] {
  if (view.byteLength < 12) throw new DataCorruptionError();

  let csr = 6;
  const instType = view.getUint16(csr, true);
  csr += 2;
  if (instType !== 1) throw new UnsupportedInstrumentTypeError();

  let name = "";
  const op = Array(4)
    .fill(0)
    .map(() => ({}) as FmOperator) as FmOperators;
  const partialInstrument: Partial<FmInstrument> = {
    op,
    lfoFreq: 0,
    ams: 0,
    pms: 0,
  };
  for (const operator of op) operator.am = false;

  while (csr < view.byteLength) {
    if (view.byteLength < csr + 4) throw new DataCorruptionError();
    const featureCode = new TextDecoder().decode(
      view.buffer.slice(view.byteOffset + csr, view.byteOffset + csr + 2)
    );
    csr += 2;
    const blockLen = view.getUint16(csr, true);
    csr += 2;

    if (view.byteLength < csr + blockLen) throw new DataCorruptionError();
    const blockEnd = csr + blockLen;

    if (featureCode === "NA") {
      const { text: readName } = readNullTerminatedString(view, csr);
      name = readName;
    } else if (featureCode === "FM") {
      csr++; // flags
      let tmp = view.getUint8(csr++);
      partialInstrument.al = tmp >> 4;
      partialInstrument.fb = tmp & 7;
      tmp = view.getUint8(csr++);
      partialInstrument.ams = (tmp >> 3) & 3;
      partialInstrument.pms = tmp & 7;
      csr++;

      const opOrder = [0, 2, 1, 3];
      for (const o of opOrder) {
        tmp = view.getUint8(csr++);
        op[o].dt = (tmp >> 4) & 7;
        op[o].ml = tmp & 15;
        op[o].tl = view.getUint8(csr++) & 127;
        tmp = view.getUint8(csr++);
        op[o].ks = tmp >> 6;
        op[o].ar = tmp & 31;
        tmp = view.getUint8(csr++);
        op[o].am = tmp >> 7 === 1;
        op[o].dr = tmp & 31;
        op[o].sr = view.getUint8(csr++) & 31;
        tmp = view.getUint8(csr++);
        op[o].sl = tmp >> 4;
        op[o].rr = tmp & 15;
        op[o].ssgEg = view.getUint8(csr++) & 15;
        csr++;
      }
    } else if (featureCode === "EN") {
      break;
    }
    csr = blockEnd;
  }

  return [partialInstrument as FmInstrument, name];
}

export async function load(
  buffer: ArrayBufferLike
): Promise<[FmInstrument, string]> {
  const view = new DataView(buffer);

  const magic = new TextDecoder().decode(buffer.slice(0, 16));

  if (magic === "-Furnace instr.-") {
    return loadOldFormat(view);
  } else if (magic.startsWith("FINS")) {
    return loadNewFormat(view);
  }
  throw new Error("File corruption error");
}

export function save(instrument: FmInstrument, name: string): ArrayBuffer {
  const nameBytes = new TextEncoder().encode(name);
  const nameLen = nameBytes.length;

  let totalSize = 4 + 2 + 2; // FINS, version, instType
  if (nameLen > 0) {
    totalSize += 2 + 2 + nameLen + 1; // NA, len, name, null
  }
  totalSize += 2 + 2 + 36; // FM, len, data

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  let csr = 0;

  new Uint8Array(buffer, csr, 4).set(new TextEncoder().encode("FINS"));
  csr += 4;
  view.setUint16(csr, 0x85, true);
  csr += 2;
  view.setUint16(csr, 1, true);
  csr += 2;

  if (nameLen > 0) {
    new Uint8Array(buffer, csr, 2).set(new TextEncoder().encode("NA"));
    csr += 2;
    view.setUint16(csr, nameLen + 1, true);
    csr += 2;
    new Uint8Array(buffer, csr, nameLen).set(nameBytes);
    csr += nameLen;
    view.setUint8(csr++, 0); // Null terminator
  }

  new Uint8Array(buffer, csr, 2).set(new TextEncoder().encode("FM"));
  csr += 2;
  view.setUint16(csr, 36, true);
  csr += 2;
  view.setUint8(csr++, 0xf4);
  view.setUint8(csr++, (instrument.al << 4) | instrument.fb);
  view.setUint8(csr++, (instrument.ams << 3) | instrument.pms);
  view.setUint8(csr++, 0);

  const opOrder = [0, 2, 1, 3];
  for (const o of opOrder) {
    const op = instrument.op[o];
    view.setUint8(csr++, (op.dt << 4) | op.ml);
    view.setUint8(csr++, op.tl);
    view.setUint8(csr++, (op.ks << 6) | op.ar);
    view.setUint8(csr++, (op.am ? 1 << 7 : 0) | op.dr);
    view.setUint8(csr++, op.sr | 0x20);
    view.setUint8(csr++, (op.sl << 4) | op.rr);
    view.setUint8(csr++, op.ssgEg);
    view.setUint8(csr++, 0);
  }

  return buffer;
}
