import { prisma } from "@/lib/prisma";
import type { TenantRow } from "@/components/admin/tenant-list";

export async function getTenantsForAdmin(): Promise<TenantRow[]> {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: {
        where: { role: "OWNER" },
        take: 1,
        select: { name: true, email: true },
      },
    },
  });

  return tenants.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    subdomain: tenant.subdomain,
    isActive: tenant.isActive,
    createdAt: tenant.createdAt.toISOString(),
    owner: tenant.users[0] ?? null,
  }));
}
