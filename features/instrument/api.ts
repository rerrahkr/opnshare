import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { EditableInstrumentMetaInfo, InstrumentDoc } from "./models";
import type { FmInstrument } from "./types";

const INSTRUMENTS_COLLECTION_NAME = "instruments";

function collectionInstruments() {
  return collection(db, INSTRUMENTS_COLLECTION_NAME);
}

function docInstruments(instrumentId: string) {
  return doc(db, INSTRUMENTS_COLLECTION_NAME, instrumentId);
}

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
  } satisfies InstrumentDoc;

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

export async function updateInstrumentDoc(
  instrumentId: string,
  metaInfo: EditableInstrumentMetaInfo
) {
  await updateDoc(docInstruments(instrumentId), {
    ...metaInfo,
    updatedAt: serverTimestamp(),
  } satisfies Partial<InstrumentDoc>);
}

export async function softDeleteInstrumentDoc(instrumentId: string) {
  await updateDoc(docInstruments(instrumentId), {
    isDeleted: true,
  } satisfies Partial<InstrumentDoc>);
}
