import { prisma } from "@/lib/prisma";
import type {
  AdminTenantDetail,
  AdminTenantSummary,
} from "@/lib/admin/tenant-shared";

function mapTenant(
  tenant: {
    id: string;
    name: string;
    slug: string;
    subdomain: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    description: string | null;
    isActive: boolean;
    isTrial: boolean;
    expiresAt: Date | null;
    adminNotes: string | null;
    createdAt: Date;
    users: { id: string; name: string; email: string }[];
    _count: {
      users: number;
      services: number;
      bookings: number;
    };
  },
  includeDetail = false,
): AdminTenantSummary | AdminTenantDetail {
  const base: AdminTenantSummary = {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    phone: tenant.phone,
    isActive: tenant.isActive,
    isTrial: tenant.isTrial,
    expiresAt: tenant.expiresAt?.toISOString() ?? null,
    adminNotes: tenant.adminNotes,
    createdAt: tenant.createdAt.toISOString(),
    owner: tenant.users[0]
      ? {
          name: tenant.users[0].name,
          email: tenant.users[0].email,
        }
      : null,
    staffCount: tenant._count.users,
    serviceCount: tenant._count.services,
    bookingCount: tenant._count.bookings,
  };

  if (!includeDetail) return base;

  const owner = tenant.users[0];

  return {
    ...base,
    subdomain: tenant.subdomain,
    email: tenant.email,
    address: tenant.address,
    description: tenant.description,
    owner: owner
      ? { id: owner.id, name: owner.name, email: owner.email }
      : null,
  };
}

const tenantInclude = {
  users: {
    where: { role: "OWNER" as const },
    take: 1,
    select: { id: true, name: true, email: true },
  },
  _count: {
    select: {
      users: { where: { role: "STAFF" as const } },
      services: true,
      bookings: true,
    },
  },
};

export async function getTenantsForAdmin(): Promise<AdminTenantSummary[]> {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: tenantInclude,
  });

  return tenants.map((tenant) => mapTenant(tenant) as AdminTenantSummary);
}

export async function getTenantByIdForAdmin(
  id: string,
): Promise<AdminTenantDetail | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: tenantInclude,
  });

  if (!tenant) return null;
  return mapTenant(tenant, true) as AdminTenantDetail;
}
