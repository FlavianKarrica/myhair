import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getPublicTenantBySlug } from "@/lib/public/tenant";
import { BookingForm } from "@/components/public/booking-form";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string; tenantSlug: string }>;
};

export default async function BookPage({ params }: Props) {
  const { locale, tenantSlug } = await params;
  setRequestLocale(locale as Locale);

  const tenant = await getPublicTenantBySlug(tenantSlug).catch(() => null);
  if (!tenant) notFound();

  const t = await getTranslations("shop.booking");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("pageTitle")}</h1>
        <p className="mt-2 text-zinc-600">
          {t("pageDesc", { shop: tenant.name })}
        </p>
      </div>

      <BookingForm
        tenantSlug={tenant.slug}
        tenantName={tenant.name}
        barbers={tenant.users}
        services={tenant.services}
      />
    </div>
  );
}
