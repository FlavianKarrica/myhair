import type { DayOfWeek } from "@/generated/prisma/client";

const JS_DAY_TO_ENUM: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export function getDayOfWeekFromDate(dateStr: string): DayOfWeek {
  const date = new Date(`${dateStr}T12:00:00`);
  return JS_DAY_TO_ENUM[date.getDay()];
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function combineDateAndTime(dateStr: string, time: string): Date {
  return new Date(`${dateStr}T${time}:00`);
}

export type TimeRange = {
  start: number;
  end: number;
};

export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

export function generateSlots(
  workStart: string,
  workEnd: string,
  durationMinutes: number,
  stepMinutes = 15,
  blocked: TimeRange[] = [],
): string[] {
  const startMin = parseTimeToMinutes(workStart);
  const endMin = parseTimeToMinutes(workEnd);
  const slots: string[] = [];

  for (let cursor = startMin; cursor + durationMinutes <= endMin; cursor += stepMinutes) {
    const slot: TimeRange = { start: cursor, end: cursor + durationMinutes };
    const conflict = blocked.some((range) => rangesOverlap(slot, range));
    if (!conflict) {
      slots.push(minutesToTime(cursor));
    }
  }

  return slots;
}
