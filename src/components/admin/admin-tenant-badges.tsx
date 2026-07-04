export function AdminStatusBadge({
  label,
  color,
  title,
}: {
  label: string;
  color: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${color}`}
    >
      {label}
    </span>
  );
}

export function AdminWebsiteBadge({
  slug,
  isActive,
}: {
  slug: string;
  isActive: boolean;
}) {
  return (
    <AdminStatusBadge
      label={isActive ? "Publikuar" : "Joaktiv"}
      color={
        isActive
          ? "bg-emerald-950/40 text-emerald-300"
          : "bg-zinc-800 text-zinc-400"
      }
      title={`/s/${slug}`}
    />
  );
}

export function AdminNotesIndicator({ notes }: { notes: string }) {
  const preview =
    notes.length > 120 ? `${notes.slice(0, 120).trim()}…` : notes;

  return (
    <span
      title={preview}
      aria-label="Shënime admin"
      className="inline-flex h-6 w-6 cursor-default items-center justify-center rounded-full bg-violet-950/40 text-violet-300"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    </span>
  );
}
