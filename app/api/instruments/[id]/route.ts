import { z } from "zod";
import { getInstrumentDoc } from "@/features/instrument/api";
import { fmInstrumentSchema } from "@/features/instrument/types";
import { getUserDoc } from "@/features/user/api";
import { instrumentInfoSchema } from "../type";

const getInstrumentResponseBodySchema = z
  .object({
    data: fmInstrumentSchema,
  })
  .merge(instrumentInfoSchema);
type GetInstrumentResponseBody = z.infer<
  typeof getInstrumentResponseBodySchema
>;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const instrumentDoc = await getInstrumentDoc(id);
    if (!instrumentDoc) {
      return new Response("Instrument not found", {
        status: 404,
      });
    }

    const userDoc = await getUserDoc(instrumentDoc.authorUid);
    const responseBody: GetInstrumentResponseBody = {
      name: instrumentDoc.name,
      author: userDoc?.userId ?? "",
      recommendedChip: instrumentDoc.chip,
      tags: instrumentDoc.tags,
      data: instrumentDoc.data,
    };

    // If parsing is failed, throw an error.
    getInstrumentResponseBodySchema.parse(responseBody);

    return Response.json(responseBody, {});
  } catch (error: unknown) {
    // Log for developer.
    console.error(error);

    return new Response("Internal Server Error", { status: 500 });
  }
}
