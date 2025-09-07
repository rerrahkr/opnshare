import type { Timestamp } from "firebase/firestore";
import { z } from "zod";
import type { FmInstrument } from "@/features/instrument/types";

// "instruments" collection
export type InstrumentDoc = EditableInstrumentMetaInfo & {
  authorUid: string;
  likeCount: number;
  data: FmInstrument;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export const recommendedChipSchema = z.union([
  z.literal("OPN"),
  z.literal("OPNA"),
  z.literal("OPNB"),
  z.literal("OPN2"),
]);

export type RecommendedChip = z.infer<typeof recommendedChipSchema>;
export const RECOMMENDED_CHIPS = [
  "OPN",
  "OPNA",
  "OPNB",
  "OPN2",
] as const satisfies RecommendedChip[];

export const instrumentTagSchema = z
  .string()
  .min(1, { message: "Tag must be at least 1 character long." })
  .max(20, { message: "Tag must be at most 20 characters long." })
  .refine((value) => value.trim() === value, {
    message: "Tag cannot have leading or trailing spaces.",
  });

export const MAX_TAGS = 5;
export const MAX_DESCRIPTION_LENGTH = 500;

export const editableInstrumentMetaInfoSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required." })
    .max(50, { message: "Name must be at most 50 characters long." })
    .refine((value) => value.trim() === value, {
      message: "Name cannot have leading or trailing spaces.",
    }),
  description: z.string().max(MAX_DESCRIPTION_LENGTH, {
    message: "Description must be at most 500 characters long.",
  }),
  tags: z.array(instrumentTagSchema).max(MAX_TAGS, {
    message: `You can add up to ${MAX_TAGS} tags.`,
  }),
  chip: recommendedChipSchema,
});

export type EditableInstrumentMetaInfo = z.infer<
  typeof editableInstrumentMetaInfoSchema
>;
