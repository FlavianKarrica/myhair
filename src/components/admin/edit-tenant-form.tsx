"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTenant } from "@/app/actions/admin/tenants";
import { HiddenSwitchValue, SwitchField } from "@/components/ui/switch-field";
import { toDateInputValue } from "@/lib/admin/tenant-shared";
import type { AdminTenantDetail } from "@/lib/admin/tenant-shared";
import type { UpdateTenantState } from "@/lib/validations/tenant";
import {
  adminCardClass,
  btnPrimaryClass,
  inputClass,
  labelClass,
  textPrimaryClass,
} from "@/lib/admin/ui-classes";

const initialState: UpdateTenantState = {};

export function EditTenantForm({ tenant }: { tenant: AdminTenantDetail }) {
  const router = useRouter();
  const wasPending = useRef(false);
  const [active, setActive] = useState(tenant.isActive);
  const [isTrial, setIsTrial] = useState(tenant.isTrial);
  const [state, action, pending] = useActionState(updateTenant, initialState);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      router.refresh();
    }
    wasPending.current = pending;
  }, [pending, state.error, router]);

  return (
    <section className={adminCardClass}>
      <h2 className={`text-sm font-semibold ${textPrimaryClass}`}>
        Të dhënat e berberisë
      </h2>
      <form action={action} className="mt-4 space-y-4">
        <input type="hidden" name="tenantId" value={tenant.id} />

        <div>
          <label htmlFor="name" className={labelClass}>
            Emri i berberisë *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={tenant.name}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>
            Slug (URL) *
          </label>
          <input
            id="slug"
            name="slug"
            required
            defaultValue={tenant.slug}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-zinc-500">/s/{tenant.slug}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className={labelClass}>
              Telefon kontakti
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={tenant.phone ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email kontakti
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={tenant.email ?? ""}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className={labelClass}>
            Adresa
          </label>
          <input
            id="address"
            name="address"
            defaultValue={tenant.address ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Përshkrimi
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={tenant.description ?? ""}
            className={`${inputClass} resize-y`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="expiresAt" className={labelClass}>
              Data e skadimit
            </label>
            <input
              id="expiresAt"
              name="expiresAt"
              type="date"
              defaultValue={toDateInputValue(tenant.expiresAt)}
              className={inputClass}
            />
          </div>
        </div>

        <HiddenSwitchValue name="isTrial" checked={isTrial} />
        <HiddenSwitchValue name="isActive" checked={active} />

        <SwitchField
          label="Berber test (provë)"
          checked={isTrial}
          onCheckedChange={setIsTrial}
          name="_isTrialUi"
        />

        <SwitchField
          label="Berber aktiv"
          checked={active}
          onCheckedChange={setActive}
          name="_isActiveUi"
        />

        <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-4">
          <button type="submit" disabled={pending} className={btnPrimaryClass}>
            {pending ? "Duke ruajtur..." : "Ruaj"}
          </button>
          {state.success ? (
            <span className="text-xs text-emerald-400">U ruajt.</span>
          ) : null}
          {state.error ? (
            <p className="text-xs text-red-400">{state.error}</p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
