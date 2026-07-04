"use client";

import { usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <span className="text-lg font-semibold tracking-tight">MyHair</span>
        <LocaleSwitcher />
      </div>
    </header>
  );
}
