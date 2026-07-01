import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getTenantSummary } from "@/lib/dashboard/queries";
import { isOwner } from "@/lib/dashboard/auth";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const session = await auth();
  const t = await getTranslations("dashboard");
  const tenantId = session?.user?.tenantId;
  const role = session?.user?.role;

  let summary = {
    staffCount: 0,
    serviceCount: 0,
    pendingBookings: 0,
    tenant: null as { name: string; slug: string; subdomain: string | null } | null,
  };

  if (tenantId) {
    try {
      summary = await getTenantSummary(tenantId);
    } catch {
      // database not ready yet
    }
  }

  const cards = [
    {
      key: "bookings" as const,
      href: "/dashboard/bookings",
      stat: summary.pendingBookings,
      ownerOnly: false,
    },
    {
      key: "staff" as const,
      href: "/dashboard/staff",
      stat: summary.staffCount,
      ownerOnly: true,
    },
    {
      key: "services" as const,
      href: "/dashboard/services",
      stat: summary.serviceCount,
      ownerOnly: true,
    },
    {
      key: "schedule" as const,
      href: "/dashboard/schedule",
      stat: null,
      ownerOnly: false,
    },
  ].filter((card) => !card.ownerOnly || (role && isOwner(role)));

  return (
    <div>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="mt-2 text-zinc-600">
        {t("welcome", { name: session?.user?.name ?? "" })}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400"
          >
            <h2 className="font-medium">{t(`cards.${card.key}.title`)}</h2>
            <p className="mt-1 text-sm text-zinc-600">
              {t(`cards.${card.key}.desc`)}
            </p>
            {card.stat !== null && (
              <p className="mt-4 text-2xl font-semibold">{card.stat}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
