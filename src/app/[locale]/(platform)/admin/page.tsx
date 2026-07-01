import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { CreateTenantForm } from "@/components/admin/create-tenant-form";
import { TenantList } from "@/components/admin/tenant-list";
import { getTenantsForAdmin } from "@/lib/admin/tenants";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("admin");

  let tenants: Awaited<ReturnType<typeof getTenantsForAdmin>> = [];

  try {
    tenants = await getTenantsForAdmin();
  } catch {
    tenants = [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-zinc-600">{t("description")}</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[400px_1fr]">
        <CreateTenantForm />
        <TenantList tenants={tenants} />
      </div>
    </div>
  );
}
