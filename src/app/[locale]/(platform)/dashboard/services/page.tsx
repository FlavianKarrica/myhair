import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import type { Locale } from "@/i18n/routing";
import { isOwner } from "@/lib/dashboard/auth";
import { getServices } from "@/lib/dashboard/queries";
import { CreateServiceForm } from "@/components/dashboard/create-service-form";
import { ServiceList } from "@/components/dashboard/service-list";
import { OwnerOnlyMessage } from "@/components/dashboard/owner-only-message";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("dashboard.services");

  const session = await auth();
  if (!session?.user?.role || !isOwner(session.user.role)) {
    return <OwnerOnlyMessage />;
  }

  let services: Awaited<ReturnType<typeof getServices>> = [];
  if (session.user.tenantId) {
    try {
      services = await getServices(session.user.tenantId);
    } catch {
      services = [];
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("pageTitle")}</h1>
        <p className="mt-2 text-zinc-600">{t("pageDesc")}</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
        <CreateServiceForm />
        <ServiceList
          services={services.map((service) => ({
            id: service.id,
            nameSq: service.nameSq,
            nameEn: service.nameEn,
            durationMinutes: service.durationMinutes,
            price: service.price.toString(),
            isActive: service.isActive,
          }))}
        />
      </div>
    </div>
  );
}
