import { collection, doc } from "firebase/firestore";
import { db } from "./app";

const USERS_COLLECTION_NAME = "users";
const LIKES_SUB_COLLECTION_NAME = "likes";

export function collectionUsers() {
  return collection(db, USERS_COLLECTION_NAME);
}

export function docUsers(uid: string) {
  return doc(db, USERS_COLLECTION_NAME, uid);
}

export function collectionLikes(userId: string) {
  return collection(docUsers(userId), LIKES_SUB_COLLECTION_NAME);
}
