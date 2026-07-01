"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toggleServiceActive } from "@/app/actions/dashboard/services";

export type ServiceRow = {
  id: string;
  nameSq: string;
  nameEn: string;
  durationMinutes: number;
  price: string;
  isActive: boolean;
};

type Props = {
  services: ServiceRow[];
};

export function ServiceList({ services }: Props) {
  const t = useTranslations("dashboard.services");
  const locale = useLocale();

  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-6 py-4">
        <h2 className="text-lg font-semibold">{t("listTitle")}</h2>
        <p className="mt-1 text-sm text-zinc-600">
          {t("listCount", { count: services.length })}
        </p>
      </div>

      {services.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-zinc-500">{t("empty")}</p>
      ) : (
        <div className="divide-y divide-zinc-100">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
            >
              <div>
                <p className="font-medium">
                  {locale === "en" ? service.nameEn : service.nameSq}
                </p>
                <p className="text-sm text-zinc-500">
                  {t("meta", {
                    duration: service.durationMinutes,
                    price: service.price,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge active={service.isActive} />
                <ToggleButton serviceId={service.id} isActive={service.isActive} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  const t = useTranslations("dashboard.services.status");
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {active ? t("active") : t("inactive")}
    </span>
  );
}

function ToggleButton({
  serviceId,
  isActive,
}: {
  serviceId: string;
  isActive: boolean;
}) {
  const t = useTranslations("dashboard.services");
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleServiceActive(serviceId, !isActive);
        })
      }
      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 disabled:opacity-60"
    >
      {pending ? t("toggling") : isActive ? t("deactivate") : t("activate")}
    </button>
  );
}
