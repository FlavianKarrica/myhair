"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function LogoutButton() {
  const t = useTranslations("common");
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
    >
      {t("logout")}
    </button>
  );
}
