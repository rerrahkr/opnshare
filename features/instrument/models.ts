import { z } from "zod";
import type { FmInstrument } from "@/features/instrument/types";
import type { Time } from "@/lib/firebase";

// "likedInstruments" collection
export type LikedInstrumentDoc = {
  id: string;
  likedAt: Time;
};

// "instruments" collection
export type InstrumentDoc = EditableInstrumentMetaInfo & {
  authorId: string;
  likeCount: number;
  data: FmInstrument;
  originalFileUrl: string;
  createdAt: Time;
  updatedAt: Time;
  isDeleted: boolean;
};

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
});

export type EditableInstrumentMetaInfo = z.infer<
  typeof editableInstrumentMetaInfoSchema
>;
