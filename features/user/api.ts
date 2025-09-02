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
  docInstruments,
  docUsers,
  type NewDoc,
  type UpdatedDoc,
} from "@/lib/firebase";
import type { InstrumentDoc } from "../instrument/models";
import type { EditableUserDoc, ReservedUserIdDoc, UserDoc } from "./models";

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

export async function getUserLikedInstrumentDocAndIds(
  uid: string
): Promise<[InstrumentDoc, string][]> {
  const q = query(collectionLikes(uid));
  const querySnapshot = await getDocs(q);
  const ids = querySnapshot.docs.map((doc) => doc.id);

  const result = await Promise.allSettled(
    ids.map((id) => getDoc(docInstruments(id)))
  );
  // Skip errors which contain access to deleted instrument.
  const allDocs = result
    .filter((res) => res.status === "fulfilled")
    .map((res) => res.value);

  const docAndIds: [InstrumentDoc, string][] = [];
  for (const docSnap of allDocs) {
    if (!docSnap.exists()) {
      continue;
    }

    const doc = docSnap.data() as InstrumentDoc;
    if (!doc.isDeleted) {
      docAndIds.push([doc, docSnap.id]);
    }
  }

  return docAndIds;
}

export async function getUidNameTable(
  uids: string[]
): Promise<Record<string, string>> {
  const userDocs = await Promise.all(uids.map((uid) => getUserDoc(uid)));
  const userTable = Object.fromEntries(
    uids.map((uid, i) => [uid, userDocs[i]?.displayName ?? ""])
  );
  return userTable;
}
