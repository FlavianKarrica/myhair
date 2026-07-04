import type { ReactNode } from "react";
import { textMutedClass, textPrimaryClass } from "@/lib/admin/ui-classes";

export function AdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <h1
          className={`text-lg font-semibold tracking-tight sm:text-xl ${textPrimaryClass}`}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className={`mt-0.5 text-xs sm:text-sm ${textMutedClass}`}>{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
