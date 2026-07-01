import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { LoginForm } from "@/components/login-form";
import { auth } from "@/auth";
import { redirectTo } from "@/lib/redirect";
import { getRoleHomePath } from "@/lib/auth-utils";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const session = await auth();
  if (session?.user?.role) {
    await redirectTo(getRoleHomePath(session.user.role));
  }

  const t = await getTranslations("auth");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="mt-2 text-sm text-zinc-600">{t("subtitle")}</p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </main>
  );
}
