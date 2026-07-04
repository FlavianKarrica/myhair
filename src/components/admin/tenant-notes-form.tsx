"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateTenantNotes } from "@/app/actions/admin/tenants";
import type { UpdateTenantState } from "@/lib/validations/tenant";
import {
  adminCardClass,
  btnPrimaryClass,
  inputClass,
  textMutedClass,
  textPrimaryClass,
} from "@/lib/admin/ui-classes";

const initialState: UpdateTenantState = {};

export function TenantNotesForm({
  tenantId,
  adminNotes,
}: {
  tenantId: string;
  adminNotes: string | null;
}) {
  const router = useRouter();
  const wasPending = useRef(false);
  const [state, action, pending] = useActionState(
    updateTenantNotes,
    initialState,
  );

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      router.refresh();
    }
    wasPending.current = pending;
  }, [pending, state.error, router]);

  return (
    <section className={adminCardClass}>
      <h2 className={`text-sm font-semibold ${textPrimaryClass}`}>Shënime</h2>
      <p className={`mt-0.5 text-[11px] ${textMutedClass}`}>Vetëm për admin.</p>
      <form action={action} className="mt-3 space-y-3">
        <input type="hidden" name="tenantId" value={tenantId} />
        <textarea
          id="adminNotes"
          name="adminNotes"
          rows={9}
          defaultValue={adminNotes ?? ""}
          placeholder="Paguar cash, kontakt, rinovim..."
          aria-label="Shënime të brendshme"
          className={`${inputClass} min-h-[9rem] resize-y`}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={pending} className={btnPrimaryClass}>
            {pending ? "..." : "Ruaj"}
          </button>
          {state.success ? (
            <span className="text-xs text-emerald-400">U ruajt.</span>
          ) : null}
          {state.error ? (
            <span className="text-xs text-red-400">{state.error}</span>
          ) : null}
        </div>
      </form>
    </section>
  );
}
