import { z } from "zod";

function zodLimitInt(max: number): z.ZodNumber {
  return z.number().int().min(0).max(max);
}

export const fmOperatorSchema = z.object({
  ar: zodLimitInt(31),
  dr: zodLimitInt(31),
  sr: zodLimitInt(31),
  rr: zodLimitInt(15),
  sl: zodLimitInt(15),
  tl: zodLimitInt(127),
  ks: zodLimitInt(3),
  ml: zodLimitInt(15),
  dt: z.preprocess((value) => {
    if (typeof value !== "number") return value;
    // Convert negative values to positive representation.
    return value < 0 ? 4 - value : value;
  }, zodLimitInt(7)),
  ssgEg: zodLimitInt(15),
  am: z.boolean(),
});

export type FmOperator = z.infer<typeof fmOperatorSchema>;

export const fmOperatorsSchema = z.tuple([
  fmOperatorSchema,
  fmOperatorSchema,
  fmOperatorSchema,
  fmOperatorSchema,
]);
export type FmOperators = z.infer<typeof fmOperatorsSchema>;

export const fmInstrumentSchema = z.object({
  al: zodLimitInt(7),
  fb: zodLimitInt(7),
  op: fmOperatorsSchema,
  lfoFreq: zodLimitInt(15),
  ams: zodLimitInt(3),
  pms: zodLimitInt(7),
});

export type FmInstrument = z.infer<typeof fmInstrumentSchema>;
