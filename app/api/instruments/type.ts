import { z } from "zod";
import {
  instrumentTagsSchema,
  recommendedChipSchema,
} from "@/features/instrument/models";

export const getInstrumentsRequestParamsSchema = z.object({
  limit: z.coerce.number().int().positive().default(20),
  nextPageToken: z.string().optional(),
});

export const instrumentInfoSchema = z.object({
  name: z.string(),
  author: z.string(),
  recommendedChip: recommendedChipSchema,
  tags: instrumentTagsSchema,
});

export const getInstrumentsResponseBodySchema = z.object({
  items: z.array(
    z
      .object({
        id: z.string(),
      })
      .merge(instrumentInfoSchema)
  ),
  total: z.number().int().nonnegative(),
  nextPageToken: z.string(),
});

export type GetInstrumentsResponseBody = z.infer<
  typeof getInstrumentsResponseBodySchema
>;
