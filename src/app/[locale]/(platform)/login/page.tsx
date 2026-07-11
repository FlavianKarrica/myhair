import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { LoginForm } from "@/components/login-form";
import { auth } from "@/auth";
import { redirectTo } from "@/lib/redirect";
import { getRoleHomePath } from "@/lib/auth-utils";
import { textMutedClass, textPrimaryClass } from "@/lib/ui-classes";

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
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className={`text-2xl font-semibold ${textPrimaryClass}`}>{t("title")}</h1>
      <p className={`mt-2 text-sm ${textMutedClass}`}>{t("subtitle")}</p>
      <div className="mt-8">
        <LoginForm />
      </div>
      <Link
        href="/"
        className={`mt-8 text-center text-sm ${textMutedClass} hover:text-zinc-900 dark:hover:text-zinc-100`}
      >
        {t("back")}
      </Link>
    </main>
  );
}
