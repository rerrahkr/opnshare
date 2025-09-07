import z from "zod";
import { recommendedChipSchema } from "@/features/instrument/models";
import { MAX_LIKE_COUNT } from "./defines";

export const searchParamsSchema = z.object({
  q: z.preprocess(
    (val) => (typeof val === "string" ? val : undefined),
    z.string().min(1).max(100).optional()
  ),

  sort: z.preprocess(
    (val) => (typeof val === "string" ? val : undefined),
    z.union([z.literal("newest"), z.literal("likes")]).default("newest")
  ),

  chip: z.preprocess((val) => {
    if (typeof val === "string") {
      return val
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    }
    return undefined;
  }, z.array(recommendedChipSchema).default([])),

  tag: z.preprocess((val) => {
    if (typeof val === "string") {
      return val
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    }
    return undefined;
  }, z.array(z.string()).default([])),

  likes: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const nums = val.split("-").map((v) => Number(v));
        return nums.some((n) => Number.isNaN(n)) ? undefined : nums;
      }
      return undefined;
    },
    z.tuple([z.number().min(0), z.number().min(0)]).default([0, MAX_LIKE_COUNT])
  ),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
export type SortBy = SearchParams["sort"];
