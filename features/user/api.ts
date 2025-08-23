import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { collectionUsers, db, docUsers } from "@/lib/firebase";
import type { EditableUserDoc, ReservedUserIdDoc, UserDoc } from "./models";

const UID_DATA_NAME = "uid";
const RESERVED_USER_IDS_COLLECTION_NAME = "reservedUserIds";

function whereUidEquals(uid: string) {
  return where(UID_DATA_NAME, "==", uid);
}

export async function getUserId(uid: string): Promise<string> {
  const q = query(collectionUsers(), whereUidEquals(uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs[0]?.id ?? "";
}

export async function testUserDocExistsByUid(uid: string): Promise<boolean> {
  const q = query(collectionUsers(), whereUidEquals(uid));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

export async function getUserDoc(userId: string): Promise<UserDoc | undefined> {
  const docSnapshot = await getDoc(docUsers(userId));
  return docSnapshot.exists() ? (docSnapshot.data() as UserDoc) : undefined;
}

/**
 * @throws `FirebaseError` or `"UserIDAlreadyExists"`.
 */
export async function createUserDocWithUserIdCheck(
  userId: string,
  uid: string,
  userDoc: EditableUserDoc
) {
  const reservedRef = doc(db, RESERVED_USER_IDS_COLLECTION_NAME, userId);
  const userRef = docUsers(userId);
  await runTransaction(db, async (transaction) => {
    const reservedDoc = await transaction.get(reservedRef);
    if (reservedDoc.exists()) {
      throw "UserIDAlreadyExists";
    }

    transaction.set(reservedRef, {
      createdAt: serverTimestamp(),
      uid,
    } satisfies ReservedUserIdDoc);

    transaction.set(userRef, {
      ...userDoc,
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } satisfies UserDoc);
  });
}

export async function updateUserDoc(userId: string, userDoc: EditableUserDoc) {
  await updateDoc(docUsers(userId), {
    ...userDoc,
    updatedAt: serverTimestamp(),
  } satisfies Partial<UserDoc>);
}

export async function deleteUserDoc(uid: string) {
  const q = query(collectionUsers(), whereUidEquals(uid));
  const querySnapshot = await getDocs(q);
  const userDoc = querySnapshot.docs[0];
  if (userDoc) {
    await deleteDoc(userDoc.ref);
  }
}
