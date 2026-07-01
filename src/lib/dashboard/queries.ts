import { prisma } from "@/lib/prisma";

export async function getTenantSummary(tenantId: string) {
  const [tenant, staffCount, serviceCount, pendingBookings] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, slug: true, subdomain: true },
    }),
    prisma.user.count({
      where: { tenantId, role: "STAFF" },
    }),
    prisma.service.count({
      where: { tenantId, isActive: true },
    }),
    prisma.booking.count({
      where: { tenantId, status: "PENDING" },
    }),
  ]);

  return { tenant, staffCount, serviceCount, pendingBookings };
}

export async function getStaffMembers(tenantId: string) {
  return prisma.user.findMany({
    where: { tenantId, role: "STAFF" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function getServices(tenantId: string) {
  return prisma.service.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStaffForSchedule(tenantId: string) {
  return prisma.user.findMany({
    where: { tenantId, role: "STAFF", isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function getSchedulesForUser(userId: string, tenantId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId },
    select: { id: true },
  });

  if (!user) return null;

  return prisma.schedule.findMany({
    where: { userId },
    orderBy: { dayOfWeek: "asc" },
  });
}
