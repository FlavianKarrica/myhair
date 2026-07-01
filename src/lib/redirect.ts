import { getLocale } from "next-intl/server";
import { redirect as nextRedirect } from "next/navigation";
import { auth } from "@/auth";

export async function redirectTo(path: string): Promise<never> {
  const locale = await getLocale();
  nextRedirect(`/${locale}${path}`);
}

export async function requireAuth() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    const locale = await getLocale();
    nextRedirect(`/${locale}/login`);
  }

  return user;
}
