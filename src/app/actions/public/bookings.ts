"use server";

import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/booking/slots";
import { combineDateAndTime } from "@/lib/booking/time";
import {
  createBookingSchema,
  getSlotsSchema,
  type BookingActionState,
} from "@/lib/validations/booking";
import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";
import { revalidateDashboardPages } from "@/lib/dashboard/revalidate";
import {
  notifyBookingCreated,
} from "@/lib/sms/booking-notifications";
import { normalizePhone } from "@/lib/sms/phone";

function revalidateShopPages(slug: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/s/${slug}`);
    revalidatePath(`/${locale}/s/${slug}/book`);
  }
}

export async function fetchAvailableSlots(input: {
  tenantSlug: string;
  barberId: string;
  date: string;
  serviceIds: string[];
}) {
  const parsed = getSlotsSchema.safeParse(input);
  if (!parsed.success) return { slots: [], totalDuration: 0, totalPrice: "0" };

  const result = await getAvailableSlots(
    parsed.data.tenantSlug,
    parsed.data.barberId,
    parsed.data.date,
    parsed.data.serviceIds,
  );

  return result ?? { slots: [], totalDuration: 0, totalPrice: "0" };
}

export async function createBooking(
  _prev: BookingActionState | null,
  formData: FormData,
): Promise<BookingActionState> {
  const serviceIds = formData.getAll("serviceIds").map(String);

  const parsed = createBookingSchema.safeParse({
    tenantSlug: formData.get("tenantSlug"),
    barberId: formData.get("barberId"),
    serviceIds,
    date: formData.get("date"),
    time: formData.get("time"),
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    customerPhone: formData.get("customerPhone"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const phoneInvalid = fieldErrors.customerPhone?.includes("INVALID_PHONE");
    return {
      success: false,
      error: phoneInvalid ? "INVALID_PHONE" : "VALIDATION_ERROR",
    };
  }

  const data = parsed.data;
  const availability = await getAvailableSlots(
    data.tenantSlug,
    data.barberId,
    data.date,
    data.serviceIds,
  );

  if (!availability) return { success: false, error: "NOT_FOUND" };
  if (!availability.slots.includes(data.time)) {
    return { success: false, error: "SLOT_UNAVAILABLE" };
  }

  const tenant = await prisma.tenant.findFirst({
    where: { slug: data.tenantSlug, isActive: true },
    select: { id: true },
  });

  if (!tenant) return { success: false, error: "NOT_FOUND" };

  const services = await prisma.service.findMany({
    where: {
      id: { in: data.serviceIds },
      tenantId: tenant.id,
      isActive: true,
    },
  });

  if (services.length !== data.serviceIds.length) {
    return { success: false, error: "NOT_FOUND" };
  }

  const startTime = combineDateAndTime(data.date, data.time);
  const endTime = new Date(
    startTime.getTime() + availability.totalDuration * 60_000,
  );

  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.booking.create({
      data: {
        tenantId: tenant.id,
        barberId: data.barberId,
        customerName: data.customerName,
        customerEmail: data.customerEmail?.toLowerCase() || null,
        customerPhone: normalizePhone(data.customerPhone)!,
        startTime,
        endTime,
        notes: data.notes || null,
        status: "PENDING",
      },
    });

    await tx.bookingService.createMany({
      data: services.map((service) => ({
        bookingId: created.id,
        serviceId: service.id,
        price: service.price,
      })),
    });

    return created;
  });

  revalidateShopPages(data.tenantSlug);
  revalidateDashboardPages();

  void notifyBookingCreated(booking.id).catch((error) => {
    console.error("[notifyBookingCreated]", error);
  });

  return { success: true, bookingId: booking.id };
}
