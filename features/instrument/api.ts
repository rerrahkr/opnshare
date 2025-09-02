import {
  addDoc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  collectionInstruments,
  db,
  docInstruments,
  docLikes,
  type NewDoc,
  type UpdatedDoc,
} from "@/lib/firebase";
import type { LikedInstrumentDoc } from "../user/models";
import type { EditableInstrumentMetaInfo, InstrumentDoc } from "./models";
import type { FmInstrument } from "./types";

export async function createInstrumentDoc(
  authorUid: string,
  instrument: FmInstrument,
  metaInfo: EditableInstrumentMetaInfo
) {
  const newDoc = {
    ...metaInfo,
    authorUid,
    likeCount: 0,
    data: instrument,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isDeleted: false,
  } satisfies NewDoc<InstrumentDoc>;

  // Assign unique document id as instrument id automatically.
  await addDoc(collectionInstruments(), newDoc);
}

export async function getInstrumentDoc(
  instrumentId: string
): Promise<InstrumentDoc | undefined> {
  const docSnapshot = await getDoc(docInstruments(instrumentId));

  if (!docSnapshot.exists()) {
    return undefined;
  }

  const instrumentDoc = docSnapshot.data() as InstrumentDoc;
  return instrumentDoc.isDeleted ? undefined : instrumentDoc;
}

type InstrumentDocsByAuthorOption = {
  order?: "latest" | "liked" | undefined;
};

const whereIsNotDeleted = where("isDeleted", "==", false);
const orderByLiked = orderBy("likeCount", "desc");
const orderByNew = orderBy("createdAt", "desc");

export async function getInstrumentDocsAndIdsByAuthor(
  authorUid: string,
  option?: InstrumentDocsByAuthorOption
): Promise<[InstrumentDoc, string][]> {
  const { order = undefined } = option || {};

  const constrainCommon = [
    where("authorUid", "==", authorUid),
    whereIsNotDeleted,
  ];
  const constrains = (() => {
    switch (order) {
      case "latest":
        return [...constrainCommon, orderByNew];
      case "liked":
        return [...constrainCommon, orderByLiked];
      default:
        return constrainCommon;
    }
  })();

  const q = query(collectionInstruments(), ...constrains);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => [doc.data() as InstrumentDoc, doc.id]);
}

export async function getInstrumentDocsAndIdsNewer(
  limitCount: number
): Promise<[InstrumentDoc, string][]> {
  const q = query(
    collectionInstruments(),
    whereIsNotDeleted,
    orderByNew,
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => [doc.data() as InstrumentDoc, doc.id]);
}

export async function getInstrumentDocsAndIdsMostLiked(
  limitCount: number
): Promise<[InstrumentDoc, string][]> {
  const q = query(
    collectionInstruments(),
    whereIsNotDeleted,
    orderByLiked,
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => [doc.data() as InstrumentDoc, doc.id]);
}

export async function updateInstrumentDoc(
  instrumentId: string,
  metaInfo: EditableInstrumentMetaInfo
) {
  await updateDoc(docInstruments(instrumentId), {
    ...metaInfo,
    updatedAt: serverTimestamp(),
  } satisfies UpdatedDoc<InstrumentDoc>);
}

export async function softDeleteInstrumentDoc(instrumentId: string) {
  await updateDoc(docInstruments(instrumentId), {
    isDeleted: true,
  } satisfies UpdatedDoc<InstrumentDoc>);
}

export async function likeInstrument(instrumentId: string, uid: string) {
  const instrumentDocRef = docInstruments(instrumentId);
  const likesDoc = docLikes(uid, instrumentId);
  await runTransaction(db, async (transaction) => {
    transaction.update(instrumentDocRef, {
      likeCount: increment(1),
    } satisfies UpdatedDoc<InstrumentDoc>);

    transaction.set(likesDoc, {
      likedAt: serverTimestamp(),
    } satisfies NewDoc<LikedInstrumentDoc>);
  });
}

export async function unlikeInstrument(instrumentId: string, uid: string) {
  const instrumentDocRef = docInstruments(instrumentId);
  const likesDoc = docLikes(uid, instrumentId);

  await runTransaction(db, async (transaction) => {
    transaction.update(instrumentDocRef, {
      likeCount: increment(-1),
    } satisfies UpdatedDoc<InstrumentDoc>);

    transaction.delete(likesDoc);
  });
}

export async function isLikedInstrument(
  instrumentId: string,
  uid: string
): Promise<boolean> {
  const docRef = docLikes(uid, instrumentId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists();
}
