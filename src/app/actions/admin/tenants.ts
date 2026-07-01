"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/auth-utils";
import { slugify, uniqueSlug } from "@/lib/slug";
import {
  createTenantSchema,
  type TenantActionState,
} from "@/lib/validations/tenant";
import { routing } from "@/i18n/routing";

function revalidateAdminPages() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin`);
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
  };
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
      },
    });

    await tx.user.create({
      data: {
        email: data.ownerEmail.toLowerCase(),
        name: data.ownerName,
        passwordHash,
        role: "OWNER",
        tenantId: tenant.id,
      },
    });
  });

  revalidateAdminPages();
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

  revalidateAdminPages();
  return { success: true };
}
