"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/auth-utils";
import { slugify, uniqueSlug } from "@/lib/slug";
import {
  createTenantSchema,
  updateTenantNotesSchema,
  updateTenantSchema,
  type TenantActionState,
  type UpdateTenantState,
} from "@/lib/validations/tenant";
import { routing } from "@/i18n/routing";

function revalidateAdminPages() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/admin`, "layout");
  }
}

function revalidateTenantPages(tenantId: string) {
  revalidateAdminPages();
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin/tenants/${tenantId}`);
  }
}

function formDataToObject(formData: FormData) {
  return {
    shopName: String(formData.get("shopName") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    subdomain: String(formData.get("subdomain") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address: String(formData.get("address") ?? ""),
    email: String(formData.get("email") ?? ""),
    ownerName: String(formData.get("ownerName") ?? ""),
    ownerEmail: String(formData.get("ownerEmail") ?? ""),
    ownerPassword: String(formData.get("ownerPassword") ?? ""),
    expiresAt: String(formData.get("expiresAt") ?? ""),
    isTrial: String(formData.get("isTrial") ?? "false"),
    isActive: String(formData.get("isActive") ?? "true"),
  };
}

function parseExpiresAt(value: string | undefined): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(`${value}T23:59:59.999Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createTenant(
  _prevState: TenantActionState | null,
  formData: FormData,
): Promise<TenantActionState> {
  const session = await auth();
  if (!session?.user || !canAccessAdmin(session.user.role)) {
    return { success: false, error: "UNAUTHORIZED" };
  }

  const raw = formDataToObject(formData);
  const parsed = createTenantSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const slug = data.slug
    ? slugify(data.slug)
    : await uniqueSlug(data.shopName, async (value) => {
        const existing = await prisma.tenant.findUnique({ where: { slug: value } });
        return Boolean(existing);
      });

  if (!slug) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      fieldErrors: { shopName: ["INVALID_SLUG"] },
    };
  }

  const subdomain = data.subdomain ? slugify(data.subdomain) : slug;

  const [slugTaken, subdomainTaken, emailTaken] = await Promise.all([
    prisma.tenant.findUnique({ where: { slug } }),
    prisma.tenant.findUnique({ where: { subdomain } }),
    prisma.user.findUnique({
      where: { email: data.ownerEmail.toLowerCase() },
    }),
  ]);

  if (slugTaken) return { success: false, error: "SLUG_TAKEN" };
  if (subdomainTaken) return { success: false, error: "SUBDOMAIN_TAKEN" };
  if (emailTaken) return { success: false, error: "EMAIL_TAKEN" };

  const passwordHash = await hash(data.ownerPassword, 12);

  await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: data.shopName,
        slug,
        subdomain,
        phone: data.phone || null,
        address: data.address || null,
        email: data.email?.toLowerCase() || null,
        isActive: data.isActive ?? true,
        isTrial: data.isTrial ?? false,
        expiresAt: parseExpiresAt(data.expiresAt),
      },
    });

    await tx.user.create({
      data: {
        email: data.ownerEmail.toLowerCase(),
        name: data.ownerName?.trim() || data.shopName,
        passwordHash,
        role: "OWNER",
        tenantId: tenant.id,
      },
    });
  });

  revalidateAdminPages();
  return { success: true };
}

export async function updateTenant(
  _prevState: UpdateTenantState | null,
  formData: FormData,
): Promise<UpdateTenantState> {
  const session = await auth();
  if (!session?.user || !canAccessAdmin(session.user.role)) {
    return { error: "Nuk keni akses." };
  }

  const raw = {
    tenantId: String(formData.get("tenantId") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    address: String(formData.get("address") ?? ""),
    description: String(formData.get("description") ?? ""),
    expiresAt: String(formData.get("expiresAt") ?? ""),
    isTrial: String(formData.get("isTrial") ?? "false"),
    isActive: String(formData.get("isActive") ?? "true"),
  };

  const parsed = updateTenantSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Kontrolloni fushat e formularit." };
  }

  const data = parsed.data;
  const slug = slugify(data.slug);

  const [existing, slugTaken] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: data.tenantId } }),
    prisma.tenant.findFirst({
      where: { slug, NOT: { id: data.tenantId } },
    }),
  ]);

  if (!existing) return { error: "Berberi nuk u gjet." };
  if (slugTaken) return { error: "Ky slug përdoret tashmë." };

  await prisma.tenant.update({
    where: { id: data.tenantId },
    data: {
      name: data.name,
      slug,
      subdomain: slug,
      phone: data.phone || null,
      email: data.email?.toLowerCase() || null,
      address: data.address || null,
      description: data.description || null,
      isActive: data.isActive ?? true,
      isTrial: data.isTrial ?? false,
      expiresAt: parseExpiresAt(data.expiresAt),
    },
  });

  revalidateTenantPages(data.tenantId);
  return { success: true };
}

export async function updateTenantNotes(
  _prevState: UpdateTenantState | null,
  formData: FormData,
): Promise<UpdateTenantState> {
  const session = await auth();
  if (!session?.user || !canAccessAdmin(session.user.role)) {
    return { error: "Nuk keni akses." };
  }

  const parsed = updateTenantNotesSchema.safeParse({
    tenantId: String(formData.get("tenantId") ?? ""),
    adminNotes: String(formData.get("adminNotes") ?? ""),
  });

  if (!parsed.success) {
    return { error: "Shënimet nuk u ruajtën." };
  }

  const { tenantId, adminNotes } = parsed.data;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { adminNotes: adminNotes || null },
  });

  revalidateTenantPages(tenantId);
  return { success: true };
}

export async function toggleTenantActive(
  tenantId: string,
  isActive: boolean,
): Promise<TenantActionState> {
  const session = await auth();
  if (!session?.user || !canAccessAdmin(session.user.role)) {
    return { success: false, error: "UNAUTHORIZED" };
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { isActive },
  });

  revalidateTenantPages(tenantId);
  return { success: true };
}
