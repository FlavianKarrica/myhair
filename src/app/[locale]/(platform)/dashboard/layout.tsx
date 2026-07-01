import { requireAuth, redirectTo } from "@/lib/redirect";
import { canAccessDashboard } from "@/lib/auth-utils";
import { LogoutButton } from "@/components/logout-button";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const t = await getTranslations("dashboard");

  if (!canAccessDashboard(user.role)) {
    await redirectTo("/login");
  }

  if (user.role === "SUPER_ADMIN") {
    await redirectTo("/admin");
  }

  if (!user.tenantId) {
    await redirectTo("/login");
  }

  const tenantId = user.tenantId!;

  const tenant = await prisma.tenant
    .findUnique({
      where: { id: tenantId },
      select: { name: true },
    })
    .catch(() => null);

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
      <DashboardNav role={user.role} tenantName={tenant?.name} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</div>
    </div>
  );
}
