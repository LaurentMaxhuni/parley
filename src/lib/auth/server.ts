import { createNeonAuth } from "@neondatabase/auth/next/server";
import { getAuthEnv } from "@/lib/env";

type NeonAuth = ReturnType<typeof createNeonAuth>;

let auth: NeonAuth | undefined;

/**
 * Neon Auth validates its cookie secret as soon as it is constructed. Keeping
 * construction behind this getter lets `next build` import route modules
 * without requiring runtime secrets, while still failing with a clear message
 * on the first request if deployment configuration is incomplete.
 */
export function getAuth(): NeonAuth {
  if (!auth) {
    const { baseUrl, cookieSecret } = getAuthEnv();
    auth = createNeonAuth({
      baseUrl,
      cookies: {
        secret: cookieSecret,
        // OAuth returns from Google are top-level cross-site navigations.
        // "lax" preserves the challenge/session cookies for that callback.
        sameSite: "lax",
      },
    });
  }

  return auth;
}
