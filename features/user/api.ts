import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  type EditableUserDoc,
  type ReservedUserIdDoc,
  type UserDoc,
} from "./models";
import { db } from "@/lib/firebase";

export async function getUserId(uid: string): Promise<string> {
  const q = query(collection(db, "users"), where("uid", "==", uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs[0]?.id ?? "";
}

export async function testUserDocExistsByUid(uid: string): Promise<boolean> {
  const q = query(collection(db, "users"), where("uid", "==", uid));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

export async function getUserDoc(userId: string): Promise<UserDoc | undefined> {
  const docSnapshot = await getDoc(doc(db, "users", userId));
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
  const reservedRef = doc(db, "reservedUserIds", userId);
  const userRef = doc(db, "users", userId);
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
  await updateDoc(doc(db, "users", userId), {
    ...userDoc,
    updatedAt: serverTimestamp(),
  });
}
