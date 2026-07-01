"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  approveBooking,
  rejectBooking,
} from "@/app/actions/dashboard/bookings";

export type DashboardBookingRow = {
  id: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  barberName: string;
  services: { nameSq: string; nameEn: string }[];
};

type Props = {
  bookings: DashboardBookingRow[];
};

export function BookingList({ bookings }: Props) {
  const t = useTranslations("dashboard.bookings");

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}

function BookingCard({ booking }: { booking: DashboardBookingRow }) {
  const t = useTranslations("dashboard.bookings");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  const start = new Date(booking.startTime);
  const dateLabel = start.toLocaleDateString(locale === "en" ? "en-GB" : "sq-AL");
  const timeLabel = start.toLocaleTimeString(locale === "en" ? "en-GB" : "sq-AL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const serviceNames = booking.services
    .map((s) => (locale === "en" ? s.nameEn : s.nameSq))
    .join(", ");

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{booking.customerName}</p>
          <p className="text-sm text-zinc-500">
            {booking.customerPhone}
            {booking.customerEmail ? ` · ${booking.customerEmail}` : ""}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">{t("barber")}</dt>
          <dd className="font-medium">{booking.barberName}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("datetime")}</dt>
          <dd className="font-medium">
            {dateLabel} · {timeLabel}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-zinc-500">{t("services")}</dt>
          <dd className="font-medium">{serviceNames}</dd>
        </div>
        {booking.notes && (
          <div className="sm:col-span-2">
            <dt className="text-zinc-500">{t("notes")}</dt>
            <dd>{booking.notes}</dd>
          </div>
        )}
      </dl>

      {booking.status === "PENDING" && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await approveBooking(booking.id);
              })
            }
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
          >
            {t("approve")}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await rejectBooking(booking.id);
              })
            }
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 disabled:opacity-60"
          >
            {t("reject")}
          </button>
        </div>
      )}
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("booking.status");

  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    CANCELLED: "bg-zinc-100 text-zinc-600",
    COMPLETED: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? styles.CANCELLED}`}
    >
      {t(status as "PENDING")}
    </span>
  );
}
