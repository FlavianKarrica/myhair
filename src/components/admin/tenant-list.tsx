"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toggleTenantActive } from "@/app/actions/admin/tenants";

export type TenantRow = {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
  isActive: boolean;
  createdAt: string;
  owner: {
    name: string;
    email: string;
  } | null;
};

type Props = {
  tenants: TenantRow[];
};

export function TenantList({ tenants }: Props) {
  const t = useTranslations("admin.tenants");

  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-6 py-4">
        <h2 className="text-lg font-semibold">{t("listTitle")}</h2>
        <p className="mt-1 text-sm text-zinc-600">
          {t("listCount", { count: tenants.length })}
        </p>
      </div>

      {tenants.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-zinc-500">
          {t("empty")}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-6 py-3 font-medium">{t("columns.shop")}</th>
                <th className="px-6 py-3 font-medium">{t("columns.owner")}</th>
                <th className="px-6 py-3 font-medium">{t("columns.url")}</th>
                <th className="px-6 py-3 font-medium">{t("columns.status")}</th>
                <th className="px-6 py-3 font-medium">{t("columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-6 py-4">
                    <p className="font-medium">{tenant.name}</p>
                    <p className="text-xs text-zinc-500">{tenant.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    {tenant.owner ? (
                      <>
                        <p>{tenant.owner.name}</p>
                        <p className="text-xs text-zinc-500">{tenant.owner.email}</p>
                      </>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/s/${tenant.slug}`}
                      className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs hover:bg-zinc-200"
                    >
                      /s/{tenant.slug}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge active={tenant.isActive} />
                  </td>
                  <td className="px-6 py-4">
                    <ToggleButton tenantId={tenant.id} isActive={tenant.isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  const t = useTranslations("admin.tenants.status");

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {active ? t("active") : t("inactive")}
    </span>
  );
}

function ToggleButton({
  tenantId,
  isActive,
}: {
  tenantId: string;
  isActive: boolean;
}) {
  const t = useTranslations("admin.tenants");
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleTenantActive(tenantId, !isActive);
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60"
    >
      {pending
        ? t("toggling")
        : isActive
          ? t("deactivate")
          : t("activate")}
    </button>
  );
}
