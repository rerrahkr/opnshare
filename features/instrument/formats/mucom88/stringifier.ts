import type { FmInstrument, FmOperator } from "../../types";
import { formatNumber3 } from "../utils";

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
  ];
  return params.map(formatNumber3).join(",");
}

export function stringify({ al, fb, op }: FmInstrument): string {
  return `  @0:{
 ${formatNumber3(fb)},${formatNumber3(al)}
 ${stringifyOperator(op[0])}
 ${stringifyOperator(op[1])}
 ${stringifyOperator(op[2])}
 ${stringifyOperator(op[3])},""}`;
}
