"use server";

import { hash } from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantContext, isOwner } from "@/lib/dashboard/auth";
import { revalidateDashboardPages } from "@/lib/dashboard/revalidate";
import {
  createStaffSchema,
  type DashboardActionState,
} from "@/lib/validations/dashboard";
import { normalizePhone } from "@/lib/sms/phone";

export async function createStaff(
  _prevState: DashboardActionState | null,
  formData: FormData,
): Promise<DashboardActionState> {
  const ctx = await getTenantContext();
  if (!ctx) return { success: false, error: "UNAUTHORIZED" };
  if (!isOwner(ctx.role)) return { success: false, error: "FORBIDDEN" };

  const parsed = createStaffSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { success: false, error: "EMAIL_TAKEN" };

  const passwordHash = await hash(data.password, 12);

  await prisma.user.create({
    data: {
      name: data.name,
      email,
      phone: normalizePhone(data.phone),
      passwordHash,
      role: "STAFF",
      tenantId: ctx.tenantId,
    },
  });

  revalidateDashboardPages();
  return { success: true };
}

export async function toggleStaffActive(
  staffId: string,
  isActive: boolean,
): Promise<DashboardActionState> {
  const ctx = await getTenantContext();
  if (!ctx) return { success: false, error: "UNAUTHORIZED" };
  if (!isOwner(ctx.role)) return { success: false, error: "FORBIDDEN" };

  const staff = await prisma.user.findFirst({
    where: { id: staffId, tenantId: ctx.tenantId, role: "STAFF" },
  });

  if (!staff) return { success: false, error: "NOT_FOUND" };

  await prisma.user.update({
    where: { id: staffId },
    data: { isActive },
  });

  revalidateDashboardPages();
  return { success: true };
}
