"use client";

import type {
  AdminOverviewStats,
  AdminTenantFilter,
} from "@/lib/admin/tenant-shared";
import { panelClass, textMutedClass, textPrimaryClass } from "@/lib/admin/ui-classes";

const FILTER_ITEMS: {
  key: AdminTenantFilter;
  label: string;
  statKey: keyof AdminOverviewStats;
  accent?: string;
}[] = [
  { key: "all", label: "Gjithsej", statKey: "total" },
  { key: "active", label: "Aktive", statKey: "active", accent: "text-emerald-400" },
  { key: "trials", label: "Test", statKey: "trials", accent: "text-violet-400" },
  {
    key: "expiringSoon",
    label: "≤ 7 ditë",
    statKey: "expiringSoon",
    accent: "text-amber-400",
  },
  { key: "expired", label: "Skaduar", statKey: "expired", accent: "text-red-400" },
  {
    key: "inactive",
    label: "Joaktive",
    statKey: "inactive",
    accent: "text-zinc-400",
  },
];

export function AdminOverview({
  stats,
  filter,
  onFilterChange,
}: {
  stats: AdminOverviewStats;
  filter: AdminTenantFilter;
  onFilterChange: (filter: AdminTenantFilter) => void;
}) {
  return (
    <div className={panelClass}>
      <div className="grid grid-cols-2 divide-y divide-zinc-800 sm:grid-cols-3 lg:grid-cols-6 sm:divide-x sm:divide-y-0">
        {FILTER_ITEMS.map((item) => {
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onFilterChange(item.key)}
              className={`px-4 py-3 text-left transition ${
                active ? "bg-zinc-800/60" : "hover:bg-zinc-800/40"
              }`}
            >
              <p
                className={`text-[11px] font-medium uppercase tracking-wide ${textMutedClass}`}
              >
                {item.label}
              </p>
              <p
                className={`mt-0.5 text-2xl font-semibold tabular-nums ${item.accent ?? textPrimaryClass}`}
              >
                {stats[item.statKey]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
