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
import {
  collectionLikes,
  collectionUsers,
  db,
  docUsers,
  type NewDoc,
  type UpdatedDoc,
} from "@/lib/firebase";
import type {
  EditableUserDoc,
  LikedInstrumentDoc,
  ReservedUserIdDoc,
  UserDoc,
} from "./models";

const USER_ID_DATA_NAME = "userId";
const RESERVED_USER_IDS_COLLECTION_NAME = "reservedUserIds";

function whereUserIdEquals(userId: string) {
  return where(USER_ID_DATA_NAME, "==", userId);
}

export async function getUserId(uid: string): Promise<string> {
  const userDoc = await getUserDoc(uid);
  return userDoc?.userId ?? "";
}

export async function testUserDocExistsByUid(uid: string): Promise<boolean> {
  return (await getUserDoc(uid)) !== undefined;
}

export async function getUserDoc(uid: string): Promise<UserDoc | undefined> {
  const docSnapshot = await getDoc(docUsers(uid));
  return docSnapshot.exists() ? (docSnapshot.data() as UserDoc) : undefined;
}

export async function getUserDocAndUidByUserId(
  userId: string
): Promise<[UserDoc, string] | undefined> {
  const q = query(collectionUsers(), whereUserIdEquals(userId));
  const querySnapshot = await getDocs(q);
  const targetDoc = querySnapshot.docs[0];
  if (!targetDoc) {
    return undefined;
  }
  return [targetDoc.data() as UserDoc, targetDoc.id];
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
  const userRef = docUsers(uid);
  await runTransaction(db, async (transaction) => {
    const reservedDoc = await transaction.get(reservedRef);
    if (reservedDoc.exists()) {
      throw "UserIDAlreadyExists";
    }

    transaction.set(reservedRef, {
      createdAt: serverTimestamp(),
      uid,
    } satisfies NewDoc<ReservedUserIdDoc>);

    transaction.set(userRef, {
      ...userDoc,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } satisfies NewDoc<UserDoc>);
  });
}

export async function updateUserDoc(uid: string, userDoc: EditableUserDoc) {
  await updateDoc(docUsers(uid), {
    ...userDoc,
    updatedAt: serverTimestamp(),
  } satisfies UpdatedDoc<UserDoc>);
}

export async function deleteUserDoc(uid: string) {
  await deleteDoc(docUsers(uid));
}

export async function getUserLikedInstrumentDocs(
  uid: string
): Promise<[LikedInstrumentDoc, string][]> {
  const q = query(collectionLikes(uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => [
    doc.data() as LikedInstrumentDoc,
    doc.id,
  ]);
}
