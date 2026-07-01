"use server";

import { prisma } from "@/lib/prisma";
import { getTenantContext, isOwner } from "@/lib/dashboard/auth";
import { revalidateDashboardPages } from "@/lib/dashboard/revalidate";
import {
  saveSchedulesSchema,
  type DashboardActionState,
} from "@/lib/validations/dashboard";
import type { DayOfWeek } from "@/generated/prisma/client";

export async function saveStaffSchedules(
  _prevState: DashboardActionState | null,
  formData: FormData,
): Promise<DashboardActionState> {
  const ctx = await getTenantContext();
  if (!ctx) return { success: false, error: "UNAUTHORIZED" };
  if (!isOwner(ctx.role)) return { success: false, error: "FORBIDDEN" };

  const userId = String(formData.get("userId") ?? "");
  const daysJson = String(formData.get("days") ?? "[]");

  let days: unknown;
  try {
    days = JSON.parse(daysJson);
  } catch {
    return { success: false, error: "VALIDATION_ERROR" };
  }

  const parsed = saveSchedulesSchema.safeParse({ userId, days });
  if (!parsed.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const staff = await prisma.user.findFirst({
    where: {
      id: parsed.data.userId,
      tenantId: ctx.tenantId,
      role: "STAFF",
    },
  });

  if (!staff) return { success: false, error: "NOT_FOUND" };

  await prisma.$transaction(async (tx) => {
    for (const day of parsed.data.days) {
      if (day.enabled) {
        await tx.schedule.upsert({
          where: {
            userId_dayOfWeek: {
              userId: parsed.data.userId,
              dayOfWeek: day.dayOfWeek as DayOfWeek,
            },
          },
          create: {
            userId: parsed.data.userId,
            dayOfWeek: day.dayOfWeek as DayOfWeek,
            startTime: day.startTime,
            endTime: day.endTime,
          },
          update: {
            startTime: day.startTime,
            endTime: day.endTime,
          },
        });
      } else {
        await tx.schedule.deleteMany({
          where: {
            userId: parsed.data.userId,
            dayOfWeek: day.dayOfWeek as DayOfWeek,
          },
        });
      }
    }
  });

  revalidateDashboardPages();
  return { success: true };
}
