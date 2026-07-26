import type { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth/server";

// Next.js 16 requires proxy.ts alongside app/ when the project uses src/app.
export default function proxy(request: NextRequest) {
  return getAuth().middleware({ loginUrl: "/auth/sign-in" })(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pricing/:path*",
    "/negotiate/:path*",
  ],
};
