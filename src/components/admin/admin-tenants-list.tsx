"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { AdminOverview } from "@/components/admin/admin-overview";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminNotesIndicator,
  AdminStatusBadge,
  AdminWebsiteBadge,
} from "@/components/admin/admin-tenant-badges";
import { CreateTenantModal } from "@/components/admin/create-tenant-modal";
import { DataTable } from "@/components/ui/data-table";
import {
  formatDateShortSq,
  matchesAdminTenantFilter,
  type AdminOverviewStats,
  type AdminTenantFilter,
  type AdminTenantSummary,
} from "@/lib/admin/tenant-shared";
import {
  adminPageClass,
  borderDefaultClass,
  btnPrimaryClass,
  emptyStateSmClass,
  errorBoxClass,
  hoverSurfaceClass,
  inputClass,
  surfaceMutedClass,
  textMutedClass,
  textPrimaryClass,
} from "@/lib/admin/ui-classes";

const TABLE_COLUMNS = [
  "Emri",
  "Telefon",
  "Website",
  "Skadon",
  "Status",
  "Shënime",
  "Test",
  "Krijuar",
] as const;

function expiryLabel(expiresAt: string | null): {
  text: string;
  color: string;
} | null {
  if (!expiresAt) return null;
  const diffDays = Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    return {
      text: "Skaduar",
      color: "bg-red-950/40 text-red-300",
    };
  }
  if (diffDays <= 7) {
    return {
      text: `${diffDays}d`,
      color: "bg-amber-950/40 text-amber-300",
    };
  }
  return {
    text: formatDateShortSq(expiresAt),
    color: "bg-zinc-800 text-zinc-400",
  };
}

function trialBadge(isTrial: boolean) {
  return (
    <AdminStatusBadge
      label={isTrial ? "Po" : "Jo"}
      color={
        isTrial
          ? "bg-violet-950/40 text-violet-300"
          : "bg-zinc-800 text-zinc-400"
      }
    />
  );
}

function activeStatusBadge(isActive: boolean) {
  return (
    <AdminStatusBadge
      label={isActive ? "Aktiv" : "Joaktiv"}
      color={
        isActive
          ? "bg-emerald-950/40 text-emerald-300"
          : "bg-zinc-800 text-zinc-400"
      }
    />
  );
}

function matchesSearch(tenant: AdminTenantSummary, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const name = tenant.name.toLowerCase();
  const phone = tenant.phone?.toLowerCase() ?? "";
  const email = tenant.owner?.email.toLowerCase() ?? "";
  const ownerName = tenant.owner?.name.toLowerCase() ?? "";

  return (
    name.includes(q) ||
    phone.includes(q) ||
    email.includes(q) ||
    ownerName.includes(q)
  );
}

export function AdminTenantsList({
  tenants,
  stats,
  errorMessage,
}: {
  tenants: AdminTenantSummary[];
  stats: AdminOverviewStats;
  errorMessage?: string;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AdminTenantFilter>("all");

  const filtered = useMemo(
    () =>
      tenants.filter(
        (t) => matchesSearch(t, search) && matchesAdminTenantFilter(t, filter),
      ),
    [tenants, search, filter],
  );

  return (
    <div className={adminPageClass}>
      <AdminPageHeader
        title="Berberitë"
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className={`${btnPrimaryClass} w-full sm:w-auto`}
          >
            + Berber i ri
          </button>
        }
      />

      <AdminOverview stats={stats} filter={filter} onFilterChange={setFilter} />

      {!errorMessage && tenants.length > 0 ? (
        <div
          className={`rounded-lg border p-3 ${borderDefaultClass} ${surfaceMutedClass}`}
        >
          <label
            htmlFor="admin-tenant-search"
            className={`mb-1 block text-[11px] font-medium ${textMutedClass}`}
          >
            Kërko
          </label>
          <input
            id="admin-tenant-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Emër, email ose telefon..."
            className={inputClass}
            autoComplete="off"
          />
        </div>
      ) : null}

      {errorMessage ? (
        <p className={errorBoxClass}>{errorMessage}</p>
      ) : filtered.length > 0 ? (
        <DataTable
          columns={[...TABLE_COLUMNS]}
          emptyColSpan={TABLE_COLUMNS.length}
          emptyMessage="Asnjë berber nuk përputhet me kërkimin."
          isEmpty={false}
          minWidthClass="min-w-[44rem]"
          comfortable
        >
          {filtered.map((tenant) => {
            const phone = tenant.phone?.trim() || null;
            const exp = expiryLabel(tenant.expiresAt);
            const cell = "px-4 py-4";

            return (
              <tr key={tenant.id} className={hoverSurfaceClass}>
                <td className={`max-w-[12rem] ${cell}`}>
                  <Link href={`/admin/tenants/${tenant.id}`} className="block min-w-0">
                    <p className={`truncate font-medium ${textPrimaryClass}`}>
                      {tenant.name}
                    </p>
                    {tenant.owner ? (
                      <p className={`truncate text-xs ${textMutedClass}`}>
                        {tenant.owner.email}
                      </p>
                    ) : null}
                  </Link>
                </td>
                <td className={`whitespace-nowrap ${cell} text-sm ${textMutedClass}`}>
                  {phone ?? "—"}
                </td>
                <td className={`whitespace-nowrap ${cell}`}>
                  <AdminWebsiteBadge slug={tenant.slug} isActive={tenant.isActive} />
                </td>
                <td className={`whitespace-nowrap ${cell}`}>
                  {exp ? (
                    <AdminStatusBadge label={exp.text} color={exp.color} />
                  ) : (
                    <span className={textMutedClass}>—</span>
                  )}
                </td>
                <td className={`whitespace-nowrap ${cell}`}>
                  {activeStatusBadge(tenant.isActive)}
                </td>
                <td className={`whitespace-nowrap ${cell}`}>
                  {tenant.adminNotes ? (
                    <AdminNotesIndicator notes={tenant.adminNotes} />
                  ) : null}
                </td>
                <td className={`whitespace-nowrap ${cell}`}>
                  {trialBadge(tenant.isTrial)}
                </td>
                <td className={`whitespace-nowrap ${cell} text-xs ${textMutedClass}`}>
                  {formatDateShortSq(tenant.createdAt)}
                </td>
              </tr>
            );
          })}
        </DataTable>
      ) : tenants.length > 0 ? (
        <p className={emptyStateSmClass}>
          Asnjë berber nuk përputhet me filtrin ose kërkimin.
        </p>
      ) : (
        <p className={emptyStateSmClass}>Nuk ka berbere ende.</p>
      )}

      <CreateTenantModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
