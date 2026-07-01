import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import type { Locale } from "@/i18n/routing";
import { isOwner } from "@/lib/dashboard/auth";
import {
  getSchedulesForUser,
  getStaffForSchedule,
} from "@/lib/dashboard/queries";
import { ScheduleEditor } from "@/components/dashboard/schedule-editor";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ staff?: string }>;
};

export default async function SchedulePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { staff: staffParam } = await searchParams;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("dashboard.schedule");

  const session = await auth();
  const user = session?.user;
  const tenantId = user?.tenantId;

  if (!user || !tenantId) return null;

  const owner = isOwner(user.role);

  let staffOptions: { id: string; name: string }[] = [];
  let selectedStaffId: string | null = null;
  let schedules: { dayOfWeek: string; startTime: string; endTime: string }[] =
    [];

  try {
    if (owner) {
      staffOptions = await getStaffForSchedule(tenantId);
      selectedStaffId =
        staffParam && staffOptions.some((s) => s.id === staffParam)
          ? staffParam
          : staffOptions[0]?.id ?? null;
    } else {
      staffOptions = [{ id: user.id, name: user.name ?? "" }];
      selectedStaffId = user.id;
    }

    if (selectedStaffId) {
      const rows = await getSchedulesForUser(selectedStaffId, tenantId);
      schedules = rows ?? [];
    }
  } catch {
    // database not ready
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("pageTitle")}</h1>
        <p className="mt-2 text-zinc-600">
          {owner ? t("pageDescOwner") : t("pageDescStaff")}
        </p>
      </div>

      <ScheduleEditor
        staff={staffOptions}
        selectedStaffId={selectedStaffId}
        schedules={schedules.map((s) => ({
          dayOfWeek: s.dayOfWeek as import("@/generated/prisma/client").DayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
        }))}
        readOnly={!owner}
      />
    </div>
  );
}
