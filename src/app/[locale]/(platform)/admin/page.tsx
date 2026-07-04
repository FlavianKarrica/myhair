import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { AdminTenantsList } from "@/components/admin/admin-tenants-list";
import {
  computeAdminStats,
  type AdminTenantSummary,
} from "@/lib/admin/tenant-shared";
import { getTenantsForAdmin } from "@/lib/admin/tenants";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  let tenants: AdminTenantSummary[] = [];
  let errorMessage: string | undefined;

  try {
    tenants = await getTenantsForAdmin();
  } catch {
    errorMessage =
      "Nuk u ngarkuan berberitë. Kontrolloni lidhjen me databazën.";
  }

  const stats = computeAdminStats(tenants);

  return (
    <AdminTenantsList
      tenants={tenants}
      stats={stats}
      errorMessage={errorMessage}
    />
  );
}
