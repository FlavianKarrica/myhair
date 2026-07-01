"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const labels: Record<Locale, string> = {
  sq: "SQ",
  en: "EN",
};

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(nextLocale: Locale) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div className="flex gap-1 rounded-lg border border-zinc-200 p-1">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchLocale(loc)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            locale === loc
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          {labels[loc]}
        </button>
      ))}
    </div>
  );
}
