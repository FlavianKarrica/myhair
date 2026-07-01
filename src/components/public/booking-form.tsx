"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  createBooking,
  fetchAvailableSlots,
} from "@/app/actions/public/bookings";
import type { BookingActionError, BookingActionState } from "@/lib/validations/booking";
import type { PublicBarber, PublicService } from "@/lib/public/tenant";
import { Link } from "@/i18n/navigation";

type Props = {
  tenantSlug: string;
  tenantName: string;
  barbers: PublicBarber[];
  services: PublicService[];
};

const initialState: BookingActionState = { success: false };

function todayString() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function BookingForm({
  tenantSlug,
  tenantName,
  barbers,
  services,
}: Props) {
  const t = useTranslations("shop.booking");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(createBooking, initialState);

  const [barberId, setBarberId] = useState(barbers[0]?.id ?? "");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [date, setDate] = useState(todayString());
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState("0");
  const [loadingSlots, startSlotTransition] = useTransition();

  const selectedBarber = barbers.find((b) => b.id === barberId);

  const availableServices = useMemo(() => {
    if (!selectedBarber) return services;
    const assigned = selectedBarber.staffServices.map((s) => s.serviceId);
    if (assigned.length === 0) return services;
    return services.filter((s) => assigned.includes(s.id));
  }, [selectedBarber, services]);

  useEffect(() => {
    setServiceIds((prev) =>
      prev.filter((id) => availableServices.some((s) => s.id === id)),
    );
  }, [availableServices]);

  useEffect(() => {
    if (!barberId || serviceIds.length === 0 || !date) {
      setSlots([]);
      setTime("");
      return;
    }

    startSlotTransition(async () => {
      const result = await fetchAvailableSlots({
        tenantSlug,
        barberId,
        date,
        serviceIds,
      });
      setSlots(result.slots);
      setTotalPrice(result.totalPrice);
      setTime((current) =>
        result.slots.includes(current) ? current : result.slots[0] ?? "",
      );
    });
  }, [tenantSlug, barberId, serviceIds, date]);

  function toggleService(id: string) {
    setServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  const errorMessage = state.error
    ? t(`errors.${state.error as BookingActionError}`)
    : null;

  if (state.success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-green-900">{t("successTitle")}</h2>
        <p className="mt-2 text-sm text-green-800">{t("successDesc")}</p>
        <Link
          href={`/s/${tenantSlug}`}
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white"
        >
          {t("backToShop")}
        </Link>
      </div>
    );
  }

  if (barbers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
        {t("noBarbers")}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="tenantSlug" value={tenantSlug} />
      <input type="hidden" name="barberId" value={barberId} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="time" value={time} />
      {serviceIds.map((id) => (
        <input key={id} type="hidden" name="serviceIds" value={id} />
      ))}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          1. {t("stepBarber")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {barbers.map((barber) => (
            <button
              key={barber.id}
              type="button"
              onClick={() => setBarberId(barber.id)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                barberId === barber.id
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white hover:border-zinc-400"
              }`}
            >
              <p className="font-medium">{barber.name}</p>
              {barber.bio && (
                <p
                  className={`mt-1 text-sm ${
                    barberId === barber.id ? "text-zinc-300" : "text-zinc-500"
                  }`}
                >
                  {barber.bio}
                </p>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          2. {t("stepServices")}
        </h2>
        <div className="space-y-2">
          {availableServices.map((service) => {
            const name = locale === "en" ? service.nameEn : service.nameSq;
            const checked = serviceIds.includes(service.id);
            return (
              <label
                key={service.id}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${
                  checked ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleService(service.id)}
                  />
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-sm text-zinc-500">
                      {service.durationMinutes} min · {service.price.toString()} €
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          3. {t("stepDateTime")}
        </h2>
        <input
          type="date"
          min={todayString()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm sm:max-w-xs"
        />

        {serviceIds.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("pickServicesFirst")}</p>
        ) : loadingSlots ? (
          <p className="text-sm text-zinc-500">{t("loadingSlots")}</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("noSlots")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  time === slot
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white hover:border-zinc-400"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          4. {t("stepContact")}
        </h2>
        <p className="text-sm text-zinc-600">{t("guestInfo")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("name")} name="customerName" required />
          <Field
            label={t("phone")}
            name="customerPhone"
            type="tel"
            required
            placeholder="+355 6x xxx xxxx"
          />
          <Field
            label={t("emailOptional")}
            name="customerEmail"
            type="email"
            className="sm:col-span-2"
          />
        </div>
        <Field label={t("notes")} name="notes" />
      </section>

      {serviceIds.length > 0 && time && (
        <p className="text-sm font-medium text-zinc-700">
          {t("summary", { shop: tenantName, price: totalPrice, time, date })}
        </p>
      )}

      {errorMessage && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={
          pending ||
          !barberId ||
          serviceIds.length === 0 ||
          !time ||
          loadingSlots
        }
        className="flex h-11 w-full items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  className = "",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
      />
    </div>
  );
}
