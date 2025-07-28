import type { FieldValue } from "firebase/firestore";

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
