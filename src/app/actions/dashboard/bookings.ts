"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getTenantContext, isOwner } from "@/lib/dashboard/auth";
import { revalidateDashboardPages } from "@/lib/dashboard/revalidate";
import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";
import type { BookingStatus } from "@/generated/prisma/client";
import {
  notifyBookingApproved,
  notifyBookingRejected,
} from "@/lib/sms/booking-notifications";

export type DashboardBookingActionState = {
  success: boolean;
  error?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "UNKNOWN";
};

function revalidateShopByTenantId(tenantId: string) {
  prisma.tenant
    .findUnique({ where: { id: tenantId }, select: { slug: true } })
    .then((tenant) => {
      if (!tenant) return;
      for (const locale of routing.locales) {
        revalidatePath(`/${locale}/s/${tenant.slug}`);
        revalidatePath(`/${locale}/s/${tenant.slug}/book`);
      }
    })
    .catch(() => undefined);
}

async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  rejectReason?: string,
): Promise<DashboardBookingActionState> {
  const ctx = await getTenantContext();
  if (!ctx) return { success: false, error: "UNAUTHORIZED" };

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, tenantId: ctx.tenantId },
  });

  if (!booking) return { success: false, error: "NOT_FOUND" };

  if (!isOwner(ctx.role) && booking.barberId !== ctx.userId) {
    return { success: false, error: "FORBIDDEN" };
  }

  if (booking.status !== "PENDING") {
    return { success: false, error: "UNKNOWN" };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status, rejectReason: rejectReason ?? null },
  });

  if (status === "APPROVED") {
    void notifyBookingApproved(bookingId).catch((error) => {
      console.error("[notifyBookingApproved]", error);
    });
  }

  if (status === "REJECTED") {
    void notifyBookingRejected(bookingId).catch((error) => {
      console.error("[notifyBookingRejected]", error);
    });
  }

  revalidateDashboardPages();
  revalidateShopByTenantId(ctx.tenantId);

  return { success: true };
}

export async function approveBooking(
  bookingId: string,
): Promise<DashboardBookingActionState> {
  return updateBookingStatus(bookingId, "APPROVED");
}

export async function rejectBooking(
  bookingId: string,
): Promise<DashboardBookingActionState> {
  return updateBookingStatus(bookingId, "REJECTED");
}

export async function getDashboardBookings() {
  const session = await auth();
  const user = session?.user;
  if (!user?.tenantId) return [];

  return prisma.booking.findMany({
    where: {
      tenantId: user.tenantId,
      ...(user.role === "STAFF" ? { barberId: user.id } : {}),
    },
    orderBy: [{ status: "asc" }, { startTime: "asc" }],
    include: {
      barber: { select: { name: true } },
      services: {
        include: {
          service: { select: { nameSq: true, nameEn: true } },
        },
      },
    },
  });
}
