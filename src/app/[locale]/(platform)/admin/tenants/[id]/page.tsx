import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EditTenantForm } from "@/components/admin/edit-tenant-form";
import { TenantMetaStrip } from "@/components/admin/tenant-meta-strip";
import { TenantNotesForm } from "@/components/admin/tenant-notes-form";
import { getTenantByIdForAdmin } from "@/lib/admin/tenants";
import {
  adminPageClass,
  btnSecondaryClass,
  textMutedClass,
} from "@/lib/admin/ui-classes";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminTenantPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale as Locale);

  const tenant = await getTenantByIdForAdmin(id).catch(() => null);

  if (!tenant) {
    notFound();
  }

  return (
    <div className={adminPageClass}>
      <Link
        href="/admin"
        className={`inline-block text-xs ${textMutedClass} hover:text-zinc-100`}
      >
        ← Berberitë
      </Link>

      <AdminPageHeader
        title={tenant.name}
        subtitle={tenant.owner?.email}
        actions={
          <>
            <span
              className={`inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium sm:w-auto ${
                tenant.isActive
                  ? "border-emerald-800 bg-emerald-950/60 text-emerald-300"
                  : "border-zinc-600 bg-zinc-800 text-zinc-400"
              }`}
            >
              {tenant.isActive ? "Aktiv" : "Joaktiv"}
            </span>
            {tenant.isTrial ? (
              <span className="inline-flex w-full items-center justify-center rounded-lg border border-violet-800 bg-violet-950/60 px-4 py-2 text-sm font-medium text-violet-300 sm:w-auto">
                Test
              </span>
            ) : null}
            <Link
              href={`/s/${tenant.slug}`}
              target="_blank"
              className={`${btnSecondaryClass} w-full text-center sm:w-auto`}
            >
              Shiko website-in
            </Link>
          </>
        }
      />

      <TenantMetaStrip
        createdAt={tenant.createdAt}
        expiresAt={tenant.expiresAt}
        isActive={tenant.isActive}
        isTrial={tenant.isTrial}
        staffCount={tenant.staffCount}
        serviceCount={tenant.serviceCount}
        bookingCount={tenant.bookingCount}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <EditTenantForm tenant={tenant} />
          {tenant.owner ? (
            <section className="rounded-lg border border-zinc-700 bg-zinc-900 p-5">
              <h2 className="text-sm font-semibold text-zinc-100">Pronari</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-zinc-500">Emri</dt>
                  <dd className="text-zinc-100">{tenant.owner.name}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Email</dt>
                  <dd className="text-zinc-100">{tenant.owner.email}</dd>
                </div>
              </dl>
            </section>
          ) : null}
        </div>

        <div className="space-y-4">
          <section className="rounded-lg border border-zinc-700 bg-zinc-900 p-5">
            <h2 className="text-sm font-semibold text-zinc-100">Website</h2>
            <p className="mt-2 break-all text-sm text-zinc-400">/s/{tenant.slug}</p>
            {tenant.subdomain ? (
              <p className="mt-1 text-xs text-zinc-500">
                Subdomain: {tenant.subdomain}.myhair.al
              </p>
            ) : null}
          </section>
          <TenantNotesForm
            tenantId={tenant.id}
            adminNotes={tenant.adminNotes}
          />
        </div>
      </div>
    </div>
  );
}
