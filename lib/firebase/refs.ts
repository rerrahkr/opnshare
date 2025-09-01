import { collection, doc } from "firebase/firestore";
import { db } from "./app";

const USERS_COLLECTION_NAME = "users";
const LIKES_SUB_COLLECTION_NAME = "likes";
const INSTRUMENTS_COLLECTION_NAME = "instruments";

export function collectionUsers() {
  return collection(db, USERS_COLLECTION_NAME);
}

export function docUsers(uid: string) {
  return doc(collectionUsers(), uid);
}

export function collectionLikes(uid: string) {
  return collection(docUsers(uid), LIKES_SUB_COLLECTION_NAME);
}

export function docLikes(uid: string, instrumentId: string) {
  return doc(collectionLikes(uid), instrumentId);
}

export function collectionInstruments() {
  return collection(db, INSTRUMENTS_COLLECTION_NAME);
}

export function docInstruments(instrumentId: string) {
  return doc(collectionInstruments(), instrumentId);
}
