"use client";

import { LogoutButton } from "@/components/logout-button";

export function AdminChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate font-semibold text-zinc-100">MyHair</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Platform admin
            </p>
          </div>
          <LogoutButton className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700" />
        </div>
      </header>
      <main className="mx-auto min-w-0 w-full max-w-5xl flex-1 p-3 sm:p-5 lg:p-6">
        {children}
      </main>
    </div>
  );
}
