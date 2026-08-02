type AuthErrorWithCode = {
  code?: string;
};

/** Explains Neon Auth's allow-list rejection without exposing implementation details. */
export function authErrorMessage(error: AuthErrorWithCode | null | undefined): string {
  if (error?.code === "INVALID_ORIGIN") {
    return "This app URL is not trusted by Neon Auth. Add the current URL to Neon Console → Auth → Configuration → Trusted origins, then try again.";
  }

  return "Authentication could not be completed. Please try again.";
}
