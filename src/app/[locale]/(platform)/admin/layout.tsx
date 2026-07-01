import { requireAuth, redirectTo } from "@/lib/redirect";
import { canAccessAdmin } from "@/lib/auth-utils";
import { LogoutButton } from "@/components/logout-button";
import { getTranslations } from "next-intl/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const t = await getTranslations("admin");

  if (!canAccessAdmin(user.role)) {
    await redirectTo("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              {t("badge")}
            </p>
            <p className="text-sm font-semibold">{user.name}</p>
          </div>
          <LogoutButton />
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</div>
    </div>
  );
}
