import { prisma } from "@/lib/prisma";

export async function getPublicTenantBySlug(slug: string) {
  return prisma.tenant.findFirst({
    where: { slug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      subdomain: true,
      logo: true,
      description: true,
      address: true,
      phone: true,
      email: true,
      users: {
        where: { role: "STAFF", isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          bio: true,
          avatar: true,
          staffServices: { select: { serviceId: true } },
        },
      },
      services: {
        where: { isActive: true },
        orderBy: { nameSq: "asc" },
        select: {
          id: true,
          nameSq: true,
          nameEn: true,
          descriptionSq: true,
          descriptionEn: true,
          durationMinutes: true,
          price: true,
        },
      },
    },
  });
}

export type PublicTenant = NonNullable<
  Awaited<ReturnType<typeof getPublicTenantBySlug>>
>;

export type PublicBarber = PublicTenant["users"][number];
export type PublicService = PublicTenant["services"][number];
