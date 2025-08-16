import type { FmInstrument, FmOperator, FmOperators } from "../../types";
import { DataCorruptionError, InvalidFormatError } from "../errors";
import { readNullTerminatedString } from "../utils";

export function load(buffer: ArrayBufferLike): [FmInstrument, string] {
  const view = new DataView(buffer);
  const textDecoder = new TextDecoder();

  let csr = 0;
  if (
    textDecoder.decode(
      view.buffer.slice(view.byteOffset + csr, view.byteOffset + csr + 4)
    ) !== "MVSI"
  ) {
    throw new InvalidFormatError("Missing 'MVSI' magic number.");
  }
  csr += 4;

  // Skip version
  csr++;

  const { text: name, length: nameLen } = readNullTerminatedString(view, csr);
  csr += nameLen;

  if (view.byteLength - csr !== 25) {
    throw new DataCorruptionError("Invalid data length.");
  }

  const op = Array(4)
    .fill(0)
    .map(() => ({}) as FmOperator) as FmOperators;

  for (let o = 0; o < 4; o++) {
    let tmp = view.getUint8(csr + o);
    const dt = (tmp & 0x70) >> 4;
    const ml = tmp & 0x0f;

    const tl = view.getUint8(csr + 4 + o) & 0x7f;

    tmp = view.getUint8(csr + 8 + o);
    const ks = tmp >> 6;
    const ar = tmp & 0x1f;

    tmp = view.getUint8(csr + 12 + o);
    const am = (tmp & 0x80) >> 7 === 1;
    const dr = tmp & 0x1f;

    const sr = view.getUint8(csr + 16 + o) & 0x1f;

    tmp = view.getUint8(csr + 20 + o);
    const sl = tmp >> 4;
    const rr = tmp & 0x0f;

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
      ssgEg: 0, // Not in format
    } satisfies FmOperator;
  }
  csr += 24;

  const tmp = view.getUint8(csr);
  const fb = (tmp >> 3) & 0x07;
  const al = tmp & 0x07;

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

export function save(instrument: FmInstrument, name: string): ArrayBuffer {
  const nameBytes = new TextEncoder().encode(name);
  const buffer = new ArrayBuffer(4 + 1 + nameBytes.length + 1 + 25);
  const view = new DataView(buffer);
  let csr = 0;

  // Magic and version
  new Uint8Array(buffer, csr, 4).set(new TextEncoder().encode("MVSI"));
  csr += 4;
  view.setUint8(csr++, 49); // ASCII of "1"

  // Name
  new Uint8Array(buffer, csr, nameBytes.length).set(nameBytes);
  csr += nameBytes.length;
  view.setUint8(csr++, 0); // Null terminator

  // Operator data (interleaved)
  for (let o = 0; o < 4; o++) {
    const op = instrument.op[o];
    view.setUint8(csr + o, (op.dt << 4) | op.ml);
    view.setUint8(csr + 4 + o, op.tl);
    view.setUint8(csr + 8 + o, (op.ks << 6) | op.ar);
    view.setUint8(csr + 12 + o, (op.am ? 1 << 7 : 0) | op.dr);
    view.setUint8(csr + 16 + o, op.sr);
    view.setUint8(csr + 20 + o, (op.sl << 4) | op.rr);
  }
  csr += 24;

  // AL/FB
  view.setUint8(csr, (instrument.fb << 3) | instrument.al);

  return buffer;
}
