import { prisma } from "@/lib/prisma";
import { formatBookingDateTime, sendSms } from "@/lib/sms/client";

async function getBookingContext(bookingId: string) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tenant: { select: { name: true, phone: true } },
      barber: { select: { name: true, phone: true } },
      services: {
        include: { service: { select: { nameSq: true } } },
      },
    },
  });
}

function serviceNames(
  services: { service: { nameSq: string } }[],
): string {
  return services.map((item) => item.service.nameSq).join(", ");
}

export async function notifyBookingCreated(bookingId: string) {
  const booking = await getBookingContext(bookingId);
  if (!booking) return;

  const { date, time } = formatBookingDateTime(booking.startTime);
  const services = serviceNames(booking.services);

  await sendSms(
    booking.customerPhone,
    `MyHair: Kerkesa juaj u dergua per ${date} ne ${time} (${services}). Berberi do ta konfirmoje me SMS.`,
  );

  const barberPhone = booking.barber.phone ?? booking.tenant.phone;
  if (barberPhone) {
    await sendSms(
      barberPhone,
      `MyHair: Rezervim i ri nga ${booking.customerName} (${booking.customerPhone}) - ${date} ${time}. ${services}. Hyni ne dashboard per ta aprovuar.`,
    );
  }
}

export async function notifyBookingApproved(bookingId: string) {
  const booking = await getBookingContext(bookingId);
  if (!booking) return;

  const { date, time } = formatBookingDateTime(booking.startTime);

  await sendSms(
    booking.customerPhone,
    `MyHair: Rezervimi juaj u APROVUA per ${date} ne ${time} te ${booking.tenant.name}. Shihemi atje!`,
  );
}

export async function notifyBookingRejected(bookingId: string) {
  const booking = await getBookingContext(bookingId);
  if (!booking) return;

  const { date, time } = formatBookingDateTime(booking.startTime);

  await sendSms(
    booking.customerPhone,
    `MyHair: Rezervimi juaj per ${date} ne ${time} u refuzua. Kontaktoni ${booking.tenant.name} per me shume info.`,
  );
}
