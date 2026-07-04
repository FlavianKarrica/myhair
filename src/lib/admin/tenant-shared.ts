export type AdminTenantFilter =
  | "all"
  | "active"
  | "trials"
  | "expiringSoon"
  | "expired"
  | "inactive";

export type AdminTenantSummary = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  isActive: boolean;
  isTrial: boolean;
  expiresAt: string | null;
  adminNotes: string | null;
  createdAt: string;
  owner: { name: string; email: string } | null;
  staffCount: number;
  serviceCount: number;
  bookingCount: number;
};

export type AdminOverviewStats = {
  total: number;
  active: number;
  trials: number;
  expiringSoon: number;
  expired: number;
  inactive: number;
};

export function computeAdminStats(
  tenants: AdminTenantSummary[],
): AdminOverviewStats {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  return {
    total: tenants.length,
    active: tenants.filter((t) => t.isActive && !isExpired(t, now)).length,
    trials: tenants.filter((t) => t.isTrial).length,
    expiringSoon: tenants.filter((t) => isExpiringSoon(t, now, weekMs)).length,
    expired: tenants.filter((t) => isExpired(t, now)).length,
    inactive: tenants.filter((t) => !t.isActive).length,
  };
}

function isExpired(tenant: AdminTenantSummary, now: number): boolean {
  if (!tenant.expiresAt) return false;
  return new Date(tenant.expiresAt).getTime() < now;
}

function isExpiringSoon(
  tenant: AdminTenantSummary,
  now: number,
  weekMs: number,
): boolean {
  if (!tenant.expiresAt || !tenant.isActive) return false;
  const exp = new Date(tenant.expiresAt).getTime();
  return exp >= now && exp <= now + weekMs;
}

export function matchesAdminTenantFilter(
  tenant: AdminTenantSummary,
  filter: AdminTenantFilter,
): boolean {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  switch (filter) {
    case "all":
      return true;
    case "active":
      return tenant.isActive && !isExpired(tenant, now);
    case "trials":
      return tenant.isTrial;
    case "expiringSoon":
      return isExpiringSoon(tenant, now, weekMs);
    case "expired":
      return isExpired(tenant, now);
    case "inactive":
      return !tenant.isActive;
    default:
      return true;
  }
}

export function formatDateShortSq(value: string): string {
  return new Date(value).toLocaleDateString("sq-AL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function defaultExpiryOneYearFromToday(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export function defaultExpiryDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function toDateInputValue(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function daysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

export type AdminTenantDetail = AdminTenantSummary & {
  subdomain: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  owner: { id: string; name: string; email: string } | null;
};
