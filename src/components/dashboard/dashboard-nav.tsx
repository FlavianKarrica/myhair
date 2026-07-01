"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { UserRole } from "@/generated/prisma/client";

type Props = {
  role: UserRole;
  tenantName?: string;
};

const ownerLinks = [
  { href: "/dashboard", key: "overview" },
  { href: "/dashboard/bookings", key: "bookings" },
  { href: "/dashboard/staff", key: "staff" },
  { href: "/dashboard/services", key: "services" },
  { href: "/dashboard/schedule", key: "schedule" },
] as const;

const staffLinks = [
  { href: "/dashboard", key: "overview" },
  { href: "/dashboard/bookings", key: "bookings" },
  { href: "/dashboard/schedule", key: "schedule" },
] as const;

export function DashboardNav({ role, tenantName }: Props) {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();
  const links = role === "OWNER" ? ownerLinks : staffLinks;

  return (
    <div className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        {tenantName && (
          <p className="pt-3 text-xs font-medium uppercase tracking-widest text-zinc-500">
            {tenantName}
          </p>
        )}
        <nav className="-mb-px flex gap-1 overflow-x-auto pt-2">
          {links.map((link) => {
            const active =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
