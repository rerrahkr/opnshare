import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENV === "preview") {
    const basicAuth = req.headers.get("authorization");
    if (basicAuth) {
      const [user, pwd] = Buffer.from(basicAuth.split(" ")[1], "base64")
        .toString()
        .split(":");
      if (user === process.env.PREVIEW_USERNAME && pwd === process.env.PREVIEW_PASSWORD) {
        return NextResponse.next();
      }
    }
    return new Response("Auth required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
    });
  }
  return NextResponse.next();
}
