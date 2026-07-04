import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createTenantSchema = z.object({
  shopName: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(slugRegex, "INVALID_SLUG")
    .optional()
    .or(z.literal("")),
  subdomain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(slugRegex, "INVALID_SUBDOMAIN")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.email("INVALID_EMAIL").optional().or(z.literal("")),
  ownerName: z.string().trim().max(100).optional().or(z.literal("")),
  ownerEmail: z.email("INVALID_EMAIL"),
  ownerPassword: z.string().min(6).max(100),
  expiresAt: z.string().optional().or(z.literal("")),
  isTrial: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v !== "false"),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

export type TenantActionError =
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "SLUG_TAKEN"
  | "SUBDOMAIN_TAKEN"
  | "EMAIL_TAKEN"
  | "NOT_FOUND"
  | "UNKNOWN";

export type TenantActionState = {
  success: boolean;
  error?: TenantActionError;
  fieldErrors?: Record<string, string[]>;
};

export const updateTenantSchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(slugRegex, "INVALID_SLUG"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.email("INVALID_EMAIL").optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
  isTrial: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v !== "false"),
});

export const updateTenantNotesSchema = z.object({
  tenantId: z.string().min(1),
  adminNotes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type UpdateTenantState = {
  success?: boolean;
  error?: string;
};
