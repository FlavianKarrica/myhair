"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { saveStaffSchedules } from "@/app/actions/dashboard/schedules";
import { ALL_DAYS } from "@/lib/dashboard/constants";
import type { DashboardActionError, DashboardActionState } from "@/lib/validations/dashboard";
import type { DayOfWeek } from "@/generated/prisma/client";

type StaffOption = { id: string; name: string };

type ScheduleRow = {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
};

type DayState = {
  dayOfWeek: DayOfWeek;
  enabled: boolean;
  startTime: string;
  endTime: string;
};

type Props = {
  staff: StaffOption[];
  selectedStaffId: string | null;
  schedules: ScheduleRow[];
  readOnly?: boolean;
};

const initialState: DashboardActionState = { success: false };

function buildInitialDays(schedules: ScheduleRow[]): DayState[] {
  return ALL_DAYS.map((day) => {
    const existing = schedules.find((s) => s.dayOfWeek === day);
    return {
      dayOfWeek: day,
      enabled: Boolean(existing),
      startTime: existing?.startTime ?? "09:00",
      endTime: existing?.endTime ?? "18:00",
    };
  });
}

export function ScheduleEditor({
  staff,
  selectedStaffId,
  schedules,
  readOnly = false,
}: Props) {
  const t = useTranslations("dashboard.schedule");
  const router = useRouter();
  const [days, setDays] = useState<DayState[]>(() => buildInitialDays(schedules));
  const [state, formAction, pending] = useActionState(saveStaffSchedules, initialState);

  const staffId = selectedStaffId ?? staff[0]?.id ?? "";

  useEffect(() => {
    setDays(buildInitialDays(schedules));
  }, [staffId, schedules]);

  const errorMessage = state.error
    ? t(`errors.${state.error as DashboardActionError}`)
    : null;

  if (staff.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
        {t("noStaff")}
      </div>
    );
  }

  function updateDay(index: number, patch: Partial<DayState>) {
    setDays((prev) =>
      prev.map((day, i) => (i === index ? { ...day, ...patch } : day)),
    );
  }

  function handleStaffChange(nextId: string) {
    router.push(`/dashboard/schedule?staff=${nextId}`);
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <p className="mt-1 text-sm text-zinc-600">{t("desc")}</p>
        </div>

        {!readOnly && staff.length > 1 && (
          <div>
            <label htmlFor="staff" className="mb-1.5 block text-sm font-medium">
              {t("selectStaff")}
            </label>
            <select
              id="staff"
              value={staffId}
              onChange={(e) => handleStaffChange(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {days.map((day, index) => (
          <div
            key={day.dayOfWeek}
            className="grid grid-cols-1 items-center gap-3 rounded-lg border border-zinc-100 p-3 sm:grid-cols-[140px_80px_1fr_1fr]"
          >
            <span className="text-sm font-medium">
              {t(`days.${day.dayOfWeek}`)}
            </span>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={day.enabled}
                disabled={readOnly}
                onChange={(e) => updateDay(index, { enabled: e.target.checked })}
              />
              {t("working")}
            </label>
            <input
              type="time"
              value={day.startTime}
              disabled={readOnly || !day.enabled}
              onChange={(e) => updateDay(index, { startTime: e.target.value })}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-50"
            />
            <input
              type="time"
              value={day.endTime}
              disabled={readOnly || !day.enabled}
              onChange={(e) => updateDay(index, { endTime: e.target.value })}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-50"
            />
          </div>
        ))}
      </div>

      {!readOnly && (
        <form action={formAction} className="mt-6">
          <input type="hidden" name="userId" value={staffId} />
          <input type="hidden" name="days" value={JSON.stringify(days)} />

          {errorMessage && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          )}
          {state.success && (
            <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              {t("success")}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
          >
            {pending ? t("saving") : t("save")}
          </button>
        </form>
      )}
    </div>
  );
}
