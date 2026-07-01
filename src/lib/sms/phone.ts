const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

export function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-().]/g, "");

  if (!cleaned) return null;

  let normalized = cleaned;

  if (normalized.startsWith("00")) {
    normalized = `+${normalized.slice(2)}`;
  } else if (normalized.startsWith("+")) {
    // already international
  } else if (normalized.startsWith("355")) {
    normalized = `+${normalized}`;
  } else if (normalized.startsWith("0")) {
    normalized = `+355${normalized.slice(1)}`;
  } else {
    normalized = `+355${normalized}`;
  }

  return PHONE_PATTERN.test(normalized) ? normalized : null;
}

export function isValidPhone(raw: string): boolean {
  return normalizePhone(raw) !== null;
}
