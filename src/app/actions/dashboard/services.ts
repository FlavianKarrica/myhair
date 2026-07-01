"use server";

import { prisma } from "@/lib/prisma";
import { getTenantContext, isOwner } from "@/lib/dashboard/auth";
import { revalidateDashboardPages } from "@/lib/dashboard/revalidate";
import {
  createServiceSchema,
  type DashboardActionState,
} from "@/lib/validations/dashboard";

export async function createService(
  _prevState: DashboardActionState | null,
  formData: FormData,
): Promise<DashboardActionState> {
  const ctx = await getTenantContext();
  if (!ctx) return { success: false, error: "UNAUTHORIZED" };
  if (!isOwner(ctx.role)) return { success: false, error: "FORBIDDEN" };

  const parsed = createServiceSchema.safeParse({
    nameSq: formData.get("nameSq"),
    nameEn: formData.get("nameEn"),
    durationMinutes: formData.get("durationMinutes"),
    price: formData.get("price"),
    descriptionSq: formData.get("descriptionSq"),
    descriptionEn: formData.get("descriptionEn"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  await prisma.service.create({
    data: {
      tenantId: ctx.tenantId,
      nameSq: data.nameSq,
      nameEn: data.nameEn,
      durationMinutes: data.durationMinutes,
      price: data.price,
      descriptionSq: data.descriptionSq || null,
      descriptionEn: data.descriptionEn || null,
    },
  });

  revalidateDashboardPages();
  return { success: true };
}

export async function toggleServiceActive(
  serviceId: string,
  isActive: boolean,
): Promise<DashboardActionState> {
  const ctx = await getTenantContext();
  if (!ctx) return { success: false, error: "UNAUTHORIZED" };
  if (!isOwner(ctx.role)) return { success: false, error: "FORBIDDEN" };

  const service = await prisma.service.findFirst({
    where: { id: serviceId, tenantId: ctx.tenantId },
  });

  if (!service) return { success: false, error: "NOT_FOUND" };

  await prisma.service.update({
    where: { id: serviceId },
    data: { isActive },
  });

  revalidateDashboardPages();
  return { success: true };
}
