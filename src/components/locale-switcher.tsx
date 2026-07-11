"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

function langButtonClass(active: boolean) {
  return `rounded-md px-2 py-1 text-xs font-medium transition ${
    active
      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
  }`;
}

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(nextLocale: Locale) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div className="flex gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchLocale(loc)}
          className={langButtonClass(locale === loc)}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
