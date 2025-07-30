import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getUserId(uid: string): Promise<string> {
  try {
    const q = query(collection(db, "users"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0]?.id ?? "";
  } catch (_error: unknown) {
    return "";
  }
}
