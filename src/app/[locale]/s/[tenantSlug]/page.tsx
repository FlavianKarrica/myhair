import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublicTenantBySlug } from "@/lib/public/tenant";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string; tenantSlug: string }>;
};

export default async function ShopPage({ params }: Props) {
  const { locale, tenantSlug } = await params;
  setRequestLocale(locale as Locale);

  const tenant = await getPublicTenantBySlug(tenantSlug).catch(() => null);
  if (!tenant) notFound();

  const t = await getTranslations("shop");

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-zinc-200 bg-white p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          {t("badge")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{tenant.name}</h1>
        {tenant.description && (
          <p className="mt-3 max-w-2xl text-zinc-600">{tenant.description}</p>
        )}

        <dl className="mt-6 flex flex-wrap gap-6 text-sm text-zinc-600">
          {tenant.address && (
            <div>
              <dt className="font-medium text-zinc-900">{t("address")}</dt>
              <dd>{tenant.address}</dd>
            </div>
          )}
          {tenant.phone && (
            <div>
              <dt className="font-medium text-zinc-900">{t("phone")}</dt>
              <dd>{tenant.phone}</dd>
            </div>
          )}
        </dl>

        <Link
          href={`/s/${tenantSlug}/book`}
          className="mt-8 inline-flex h-11 items-center rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white hover:bg-zinc-700"
        >
          {t("bookCta")}
        </Link>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t("teamTitle")}</h2>
        {tenant.users.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">{t("noTeam")}</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {tenant.users.map((barber) => (
              <div
                key={barber.id}
                className="rounded-xl border border-zinc-200 bg-white p-5"
              >
                <p className="font-medium">{barber.name}</p>
                {barber.bio && (
                  <p className="mt-1 text-sm text-zinc-600">{barber.bio}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t("servicesTitle")}</h2>
        {tenant.services.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">{t("noServices")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
            {tenant.services.map((service) => (
              <li
                key={service.id}
                className="flex items-center justify-between px-5 py-4 text-sm"
              >
                <span className="font-medium">
                  {locale === "en" ? service.nameEn : service.nameSq}
                </span>
                <span className="text-zinc-500">
                  {service.durationMinutes} min · {service.price.toString()} €
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
