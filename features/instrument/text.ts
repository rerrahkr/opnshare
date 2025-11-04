import type { FmInstrument, FmOperator } from "./types";

function operatorToText(op: FmOperator): string {
  return `AR=${op.ar}, DR=${op.dr}, SR=${op.sr}, RR=${op.rr}, SL=${op.sl}, TL=${op.tl}, KS=${op.ks}, ML=${op.ml}, DT=${op.dt}, AM=${op.am ? "ON" : "OFF"}, SSGEG=${op.ssgEg}`;
}

export function instrumentToText(instrument: FmInstrument): string {
  return `AL: ${instrument.al}
FB: ${instrument.fb}
OP1: ${operatorToText(instrument.op[0])}
OP2: ${operatorToText(instrument.op[1])}
OP3: ${operatorToText(instrument.op[2])}
OP4: ${operatorToText(instrument.op[3])}
LFO: Freq=${instrument.lfoFreq}, AMS=${instrument.ams}, PMS=${instrument.pms}`;
}
