import { z } from "zod";
import { isValidPhone } from "@/lib/sms/phone";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export type DashboardActionError =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "EMAIL_TAKEN"
  | "NOT_FOUND"
  | "UNKNOWN";

export type DashboardActionState = {
  success: boolean;
  error?: DashboardActionError;
  fieldErrors?: Record<string, string[]>;
};

export const createStaffSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email("INVALID_EMAIL"),
  phone: z
    .string()
    .trim()
    .min(9)
    .max(20)
    .refine((value) => isValidPhone(value), "INVALID_PHONE"),
  password: z.string().min(6).max(100),
});

export const createServiceSchema = z.object({
  nameSq: z.string().trim().min(2).max(100),
  nameEn: z.string().trim().min(2).max(100),
  durationMinutes: z.coerce.number().int().min(5).max(480),
  price: z.coerce.number().min(0).max(99999),
  descriptionSq: z.string().trim().max(500).optional().or(z.literal("")),
  descriptionEn: z.string().trim().max(500).optional().or(z.literal("")),
});

export const dayOfWeekSchema = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export const scheduleDaySchema = z
  .object({
    dayOfWeek: dayOfWeekSchema,
    enabled: z.coerce.boolean(),
    startTime: z.string().regex(timeRegex, "INVALID_TIME"),
    endTime: z.string().regex(timeRegex, "INVALID_TIME"),
  })
  .refine(
    (data) => !data.enabled || data.startTime < data.endTime,
    { message: "INVALID_RANGE", path: ["endTime"] },
  );

export const saveSchedulesSchema = z.object({
  userId: z.string().min(1),
  days: z.array(scheduleDaySchema).length(7),
});
