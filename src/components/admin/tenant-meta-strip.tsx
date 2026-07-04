import type { ReactNode } from "react";
import {
  daysUntilExpiry,
  formatDateShortSq,
} from "@/lib/admin/tenant-shared";
import {
  panelClass,
  textMutedClass,
  textPrimaryClass,
} from "@/lib/admin/ui-classes";

function MetaCell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 px-4 py-3">
      <p
        className={`text-[11px] font-medium uppercase tracking-wide ${textMutedClass}`}
      >
        {label}
      </p>
      <div className={`mt-1 text-sm font-medium ${textPrimaryClass}`}>
        {children}
      </div>
    </div>
  );
}

export function TenantMetaStrip({
  createdAt,
  expiresAt,
  isActive,
  isTrial,
  staffCount,
  serviceCount,
  bookingCount,
}: {
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
  isTrial: boolean;
  staffCount: number;
  serviceCount: number;
  bookingCount: number;
}) {
  const days = daysUntilExpiry(expiresAt);
  const created = formatDateShortSq(createdAt);
  const expiryDate = expiresAt ? formatDateShortSq(expiresAt) : null;

  let statusText = "Joaktiv";
  let statusClass = "text-zinc-400";
  if (isActive) {
    if (days === null) {
      statusText = "Aktiv · pa limit";
      statusClass = "text-emerald-400";
    } else if (days < 0) {
      statusText = "Skaduar";
      statusClass = "text-red-400";
    } else {
      statusText = `Aktiv · ${days} ditë`;
      statusClass =
        days <= 7 ? "text-amber-400" : "text-emerald-400";
    }
  }

  return (
    <div className={panelClass}>
      <div className="grid grid-cols-1 divide-y divide-zinc-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <MetaCell label="Abonimi">
          <span className={statusClass}>{statusText}</span>
          {isTrial ? (
            <p className="mt-1 text-xs font-medium text-violet-400">
              Llogari test
            </p>
          ) : null}
          {expiryDate ? (
            <p className={`mt-0.5 text-xs font-normal ${textMutedClass}`}>
              {days !== null && days < 0 ? "Skadoi " : "Skadon "}
              {expiryDate}
            </p>
          ) : isActive ? (
            <p className={`mt-0.5 text-xs font-normal ${textMutedClass}`}>
              Pa datë skadimi
            </p>
          ) : null}
        </MetaCell>
        <MetaCell label="Aktiviteti">
          <p>
            {staffCount} staf · {serviceCount} shërbime · {bookingCount}{" "}
            rezervime
          </p>
        </MetaCell>
        <MetaCell label="Krijuar">{created}</MetaCell>
      </div>
    </div>
  );
}
