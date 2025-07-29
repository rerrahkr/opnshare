import type { FieldValue } from "firebase/firestore";
import { z } from "zod";

export type UserDoc = {
  uid: string;
  displayName: string;
  bio: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

export type ReservedUserIdDoc = {
  uid: string;
  createdAt: FieldValue;
};

export const userIdSchema = z
  .string()
  .max(15, { message: "User ID must be at most 15 characters long." })
  .regex(/^[A-Za-z0-9_-]+$/, {
    message:
      "User ID can only contain letters, numbers, underscores, and hyphens.",
  })
  .refine((value) => !/[_-]*admin[_-]*/.test(value), {
    message: "This user ID is not allowed.",
  });
