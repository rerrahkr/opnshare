import type { FmInstrument, FmOperator } from "../../types";
import { formatNumber2 } from "../utils";

function stringifyOperator(op: FmOperator): string {
  const params = [
    op.ar,
    op.dr,
    op.sr,
    op.rr,
    op.sl,
    op.tl,
    op.ks,
    op.ml,
    op.dt,
    op.am ? 1 : 0,
  ];
  return params.map(formatNumber2).join(" ");
}

export function stringify({ al, fb, op }: FmInstrument): string {
  return `@0 ${formatNumber2(al)} ${formatNumber2(fb)}
   ${stringifyOperator(op[0])}
   ${stringifyOperator(op[1])}
   ${stringifyOperator(op[2])}
   ${stringifyOperator(op[3])}`;
}
