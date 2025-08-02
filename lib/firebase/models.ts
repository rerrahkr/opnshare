import type { FieldValue, Timestamp } from "firebase/firestore";
import { z } from "zod";

type Time = Timestamp | FieldValue;

export const editableUserDocSchema = z.object({
  displayName: z
    .string()
    .min(1, { message: "Display name is required." })
    .max(50, { message: "Display name must be at most 50 characters long." })
    .refine((value) => value.trim() === value, {
      message: "Display name cannot have leading or trailing spaces.",
    }),
  bio: z
    .string()
    .max(500, { message: "Bio must be at most 500 characters long." }),
});

export type EditableUserDoc = z.infer<typeof editableUserDocSchema>;

export type UserDoc = EditableUserDoc & {
  uid: string;
  createdAt: Time;
  updatedAt: Time;
};

export type ReservedUserIdDoc = {
  uid: string;
  createdAt: Time;
};

export const userIdSchema = z
  .string()
  .max(15, { message: "User ID must be at most 15 characters long." })
  .regex(/^[A-Za-z0-9_-]+$/, {
    message:
      "User ID can only contain letters, numbers, underscores, and hyphens.",
  })
  .refine((value) => !/.*admin.*/.test(value), {
    message: "This user ID is not allowed.",
  });
