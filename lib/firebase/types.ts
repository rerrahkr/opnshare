import type { FieldValue } from "firebase/firestore";

export type NewDoc<T> = {
  [K in keyof T]: T[K] | FieldValue;
};

export type UpdatedDoc<T> = Partial<NewDoc<T>>;
