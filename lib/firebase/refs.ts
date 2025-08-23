import { collection, doc } from "firebase/firestore";
import { db } from "./app";

const USERS_COLLECTION_NAME = "users";

export function collectionUsers() {
  return collection(db, USERS_COLLECTION_NAME);
}

export function docUsers(userId: string) {
  return doc(db, USERS_COLLECTION_NAME, userId);
}
