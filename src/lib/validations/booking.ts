import { z } from "zod";
import { isValidPhone, normalizePhone } from "@/lib/sms/phone";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export type BookingActionError =
  | "VALIDATION_ERROR"
  | "INVALID_PHONE"
  | "NOT_FOUND"
  | "SLOT_UNAVAILABLE"
  | "UNKNOWN";

export type BookingActionState = {
  success: boolean;
  error?: BookingActionError;
  bookingId?: string;
};

export const createBookingSchema = z.object({
  tenantSlug: z.string().min(1),
  barberId: z.string().min(1),
  serviceIds: z.array(z.string().min(1)).min(1),
  date: z.string().regex(dateRegex),
  time: z.string().regex(timeRegex),
  customerName: z.string().trim().min(2).max(100),
  customerEmail: z.union([z.literal(""), z.email("INVALID_EMAIL")]),
  customerPhone: z
    .string()
    .trim()
    .min(9)
    .max(20)
    .refine((value) => isValidPhone(value), "INVALID_PHONE"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const getSlotsSchema = z.object({
  tenantSlug: z.string().min(1),
  barberId: z.string().min(1),
  date: z.string().regex(dateRegex),
  serviceIds: z.array(z.string().min(1)).min(1),
});
