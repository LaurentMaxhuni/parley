import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth/server";

export async function requireUser() {
  const { data: session } = await getAuth().getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return session.user;
}
