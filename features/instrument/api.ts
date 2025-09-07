import {
  addDoc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  type QueryConstraint,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
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

export type SearchInstrumentsOptions = {
  searchQuery?: string;
  sortBy: "newest" | "likes";
  chips: string[];
  tags: string[];
  // likeRange: [number, number];
  pageSize: number;
  lastDoc?:
    | {
        id: string;
        doc: InstrumentDoc;
      }
    | undefined;
};

export async function searchInstruments(
  options: SearchInstrumentsOptions
): Promise<{ docs: [InstrumentDoc, string][]; hasMore: boolean }> {
  const {
    searchQuery,
    sortBy,
    chips,
    tags,
    /* likeRange, */ lastDoc,
    pageSize,
  } = options;

  const constraints: QueryConstraint[] = [whereIsNotDeleted];

  if (searchQuery && searchQuery.length > 0) {
    const endString =
      searchQuery.slice(0, -1) +
      String.fromCharCode(searchQuery.charCodeAt(searchQuery.length - 1) + 1);
    constraints.push(where("name", ">=", searchQuery));
    constraints.push(where("name", "<", endString));
    constraints.push(orderBy("name"));
  }

  if (tags.length > 0) {
    constraints.push(where("tags", "array-contains-any", tags));
  }

  if (chips.length > 0) {
    constraints.push(where("chip", "in", chips));
  }

  // constraints.push(where("likeCount", ">=", likeRange[0]));
  // if (likeRange[1] !== Infinity) {
  //   constraints.push(where("likeCount", "<=", likeRange[1]));
  // }

  switch (sortBy) {
    case "newest":
      constraints.push(orderByNew);
      break;

    case "likes":
      constraints.push(orderByLiked);
      break;
  }

  // Sub constraint
  constraints.push(orderBy("__name__", "desc"));

  constraints.push(limit(pageSize + 1)); // Get one extra to check if there are more

  let baseQuery = query(collectionInstruments(), ...constraints);

  // If we have a last document, start after it
  if (lastDoc) {
    switch (sortBy) {
      case "newest":
        baseQuery = query(
          baseQuery,
          startAfter(lastDoc.doc.createdAt, lastDoc.id)
        );
        break;

      case "likes":
        baseQuery = query(
          baseQuery,
          startAfter(lastDoc.doc.likeCount, lastDoc.id)
        );
        break;
    }
  }

  const querySnapshot = await getDocs(baseQuery);
  const docs: [InstrumentDoc, string][] = querySnapshot.docs
    .slice(0, pageSize)
    .map((doc) => [doc.data() as InstrumentDoc, doc.id]);

  // TODO: Implement full-text search for `searchQuery` if needed

  return {
    docs,
    hasMore: querySnapshot.docs.length > pageSize,
  };
}
