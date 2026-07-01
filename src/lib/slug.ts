export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const normalized = slugify(base);
  if (!normalized) return "";

  let candidate = normalized;
  let suffix = 1;

  while (await exists(candidate)) {
    candidate = `${normalized}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
