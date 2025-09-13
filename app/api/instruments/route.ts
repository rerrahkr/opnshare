import { URL } from "node:url";
import { Timestamp } from "firebase/firestore";
import {
  getTotalCountOfInstruments,
  type LastDocumentInfo,
  searchInstruments,
} from "@/features/instrument/api";
import { getUidUserIdTable } from "@/features/user/api";
import { decryptObject, encryptObject } from "@/lib/crypto";
import {
  type GetInstrumentsResponseBody,
  getInstrumentsRequestParamsSchema,
  getInstrumentsResponseBodySchema,
} from "./type";

type NextPageCursor = Omit<LastDocumentInfo, "createdAt"> & {
  /// Handle Timestamp as milliseconds number.
  createdAt: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const parseResult = getInstrumentsRequestParamsSchema.safeParse(params);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const errorFields = Object.keys(fieldErrors).join(", ");
    return new Response(`Invalid params: ${errorFields}`, {
      status: 400,
    });
  }

  try {
    const cursor: NextPageCursor | undefined = parseResult.data.nextPageToken
      ? decryptObject<NextPageCursor>(parseResult.data.nextPageToken)
      : undefined;
    console.log("token", cursor);

    const lastDoc = cursor
      ? ({
          id: cursor.id,
          createdAt: Timestamp.fromMillis(cursor.createdAt),
          likeCount: cursor.likeCount,
        } satisfies LastDocumentInfo)
      : undefined;

    const { docs, hasMore } = await searchInstruments({
      sortBy: "newest",
      pageSize: parseResult.data.limit,
      lastDoc,
    });

    const uids = [...new Set(docs.map(([doc]) => doc.authorUid))];
    const userTable = await getUidUserIdTable(uids);

    const totalCount = await getTotalCountOfInstruments();

    const nextPageToken = hasMore
      ? encryptObject({
          id: docs[docs.length - 1][1],
          createdAt: docs[docs.length - 1][0].createdAt.toMillis(),
          likeCount: docs[docs.length - 1][0].likeCount,
        } satisfies NextPageCursor)
      : "";

    const responseBody: GetInstrumentsResponseBody = {
      items: docs.map(([doc, id]) => ({
        id,
        name: doc.name,
        author: userTable[doc.authorUid] ?? "",
        recommendedChip: doc.chip,
        tags: doc.tags,
      })),
      total: totalCount,
      nextPageToken,
    };

    // If parsing is failed, throw an error.
    getInstrumentsResponseBodySchema.parse(responseBody);

    return Response.json(responseBody);
  } catch (error: unknown) {
    // Log for developer.
    console.error(error);

    return new Response("Internal Server Error", { status: 500 });
  }
}
