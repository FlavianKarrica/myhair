import { prisma } from "@/lib/prisma";
import {
  combineDateAndTime,
  generateSlots,
  getDayOfWeekFromDate,
  parseTimeToMinutes,
  type TimeRange,
} from "@/lib/booking/time";

export async function getAvailableSlots(
  tenantSlug: string,
  barberId: string,
  date: string,
  serviceIds: string[],
): Promise<{ slots: string[]; totalDuration: number; totalPrice: string } | null> {
  const tenant = await prisma.tenant.findFirst({
    where: { slug: tenantSlug, isActive: true },
    select: { id: true },
  });

  if (!tenant) return null;

  const barber = await prisma.user.findFirst({
    where: {
      id: barberId,
      tenantId: tenant.id,
      role: "STAFF",
      isActive: true,
    },
  });

  if (!barber) return null;

  const services = await prisma.service.findMany({
    where: {
      id: { in: serviceIds },
      tenantId: tenant.id,
      isActive: true,
    },
  });

  if (services.length !== serviceIds.length || services.length === 0) {
    return null;
  }

  const staffServiceCount = await prisma.staffService.count({
    where: { userId: barberId },
  });

  if (staffServiceCount > 0) {
    const allowed = await prisma.staffService.findMany({
      where: { userId: barberId, serviceId: { in: serviceIds } },
    });
    if (allowed.length !== serviceIds.length) return null;
  }

  const dayOfWeek = getDayOfWeekFromDate(date);
  const schedule = await prisma.schedule.findUnique({
    where: { userId_dayOfWeek: { userId: barberId, dayOfWeek } },
  });

  if (!schedule) {
    return { slots: [], totalDuration: 0, totalPrice: "0" };
  }

  const dayStart = combineDateAndTime(date, "00:00");
  const dayEnd = combineDateAndTime(date, "23:59");

  const [timeOffs, bookings] = await Promise.all([
    prisma.timeOff.findMany({
      where: {
        userId: barberId,
        startDate: { lte: dayEnd },
        endDate: { gte: dayStart },
      },
    }),
    prisma.booking.findMany({
      where: {
        barberId,
        tenantId: tenant.id,
        status: { in: ["PENDING", "APPROVED"] },
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart },
      },
    }),
  ]);

  const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalPrice = services
    .reduce((sum, s) => sum + Number(s.price), 0)
    .toFixed(2);

  const blocked: TimeRange[] = [];

  for (const booking of bookings) {
    blocked.push({
      start:
        booking.startTime.getHours() * 60 + booking.startTime.getMinutes(),
      end: booking.endTime.getHours() * 60 + booking.endTime.getMinutes(),
    });
  }

  for (const timeOff of timeOffs) {
    const offStart =
      timeOff.startDate <= dayStart
        ? 0
        : timeOff.startDate.getHours() * 60 + timeOff.startDate.getMinutes();
    const offEnd =
      timeOff.endDate >= dayEnd
        ? 24 * 60
        : timeOff.endDate.getHours() * 60 + timeOff.endDate.getMinutes();
    blocked.push({ start: offStart, end: offEnd });
  }

  const slots = generateSlots(
    schedule.startTime,
    schedule.endTime,
    totalDuration,
    15,
    blocked,
  );

  const now = new Date();
  const filteredSlots = slots.filter((slot) => {
    const slotDate = combineDateAndTime(date, slot);
    return slotDate > now;
  });

  return { slots: filteredSlots, totalDuration, totalPrice };
}
