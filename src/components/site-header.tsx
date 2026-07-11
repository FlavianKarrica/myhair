"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { ThemeToggleIcon } from "@/components/theme-toggle-icon";

const navTextClass =
  "text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

const loginBtnClass =
  "rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200";

function langButtonClass(active: boolean) {
  return `transition ${
    active
      ? "font-semibold text-zinc-900 dark:text-zinc-100"
      : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
  }`;
}

function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(next: Locale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      className="flex items-center gap-1.5 text-xs"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => switchTo("en")}
        className={langButtonClass(locale === "en")}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
        /
      </span>
      <button
        type="button"
        onClick={() => switchTo("sq")}
        className={langButtonClass(locale === "sq")}
        aria-pressed={locale === "sq"}
      >
        SQ
      </button>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const t = useTranslations("common");

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isHome = pathname === "/";
  const isLogin = pathname === "/login";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="shrink-0 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          MyHair
        </Link>

        <div className="hidden flex-1 md:block" />

        <div className="flex shrink-0 items-center gap-4">
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggleIcon variant="ghost" />
          </div>

          <span
            className="hidden h-5 w-px bg-zinc-200 sm:block dark:bg-zinc-700"
            aria-hidden
          />

          {isHome ? (
            <Link href="/login" className={loginBtnClass}>
              {t("login")}
            </Link>
          ) : isLogin ? (
            <Link href="/" className={navTextClass}>
              {t("home")}
            </Link>
          ) : (
            <Link href="/" className={navTextClass}>
              {t("home")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
