import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getDashboardBookings } from "@/app/actions/dashboard/bookings";
import { BookingList } from "@/components/dashboard/booking-list";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BookingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("dashboard.bookings");

  let bookings: Awaited<ReturnType<typeof getDashboardBookings>> = [];
  try {
    bookings = await getDashboardBookings();
  } catch {
    bookings = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("pageTitle")}</h1>
        <p className="mt-2 text-zinc-600">{t("pageDesc")}</p>
      </div>

      <BookingList
        bookings={bookings.map((booking) => ({
          id: booking.id,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          customerPhone: booking.customerPhone,
          startTime: booking.startTime.toISOString(),
          endTime: booking.endTime.toISOString(),
          status: booking.status,
          notes: booking.notes,
          barberName: booking.barber.name,
          services: booking.services.map((item) => ({
            nameSq: item.service.nameSq,
            nameEn: item.service.nameEn,
          })),
        }))}
      />
    </div>
  );
}
