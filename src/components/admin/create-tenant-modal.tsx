"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createTenant } from "@/app/actions/admin/tenants";
import { FormModal, ModalActions } from "@/components/ui/form-modal";
import { HiddenSwitchValue, SwitchField } from "@/components/ui/switch-field";
import {
  defaultExpiryDaysFromToday,
  defaultExpiryOneYearFromToday,
} from "@/lib/admin/tenant-shared";
import type { TenantActionState } from "@/lib/validations/tenant";
import {
  borderDefaultClass,
  btnPrimaryClass,
  btnSecondaryClass,
  errorBoxClass,
  inputClass,
  labelClass,
  modalFormClass,
  surfaceMutedClass,
  textPrimaryClass,
} from "@/lib/admin/ui-classes";

const initialState: TenantActionState = { success: false };

export function CreateTenantModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const wasPending = useRef(false);
  const [active, setActive] = useState(true);
  const [isTrial, setIsTrial] = useState(false);
  const [expiryDefault, setExpiryDefault] = useState(defaultExpiryOneYearFromToday);
  const [state, action, pending] = useActionState(createTenant, initialState);

  useEffect(() => {
    if (wasPending.current && !pending && state.success) {
      onClose();
    }
    wasPending.current = pending;
  }, [pending, state.success, onClose]);

  useEffect(() => {
    if (open) {
      setActive(true);
      setIsTrial(false);
      setExpiryDefault(defaultExpiryOneYearFromToday());
    }
  }, [open]);

  useEffect(() => {
    setExpiryDefault(
      isTrial ? defaultExpiryDaysFromToday(7) : defaultExpiryOneYearFromToday(),
    );
  }, [isTrial]);

  const errorMessage = state.error
    ? state.error === "EMAIL_TAKEN"
      ? "Ky email përdoret tashmë."
      : state.error === "SLUG_TAKEN"
        ? "Ky slug ekziston tashmë."
        : "Kontrolloni fushat e formularit."
    : null;

  return (
    <FormModal open={open} onClose={onClose} title="Berber i ri">
      <form action={action} className={modalFormClass}>
        <div>
          <label htmlFor="shopName" className={labelClass}>
            Emri i berberisë *
          </label>
          <input
            id="shopName"
            name="shopName"
            required
            placeholder="P.sh. Berberi X"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Telefon kontakti
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+355 6x xxx xxxx"
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
            placeholder="info@berberi.com"
            className={inputClass}
          />
        </div>

        <div
          className={`space-y-4 rounded-lg border p-4 ${borderDefaultClass} ${surfaceMutedClass}`}
        >
          <p className={`text-sm font-medium ${textPrimaryClass}`}>
            Pronari i dashboard-it
          </p>
          <div>
            <label htmlFor="ownerName" className={labelClass}>
              Emri i pronarit (opsional)
            </label>
            <input
              id="ownerName"
              name="ownerName"
              placeholder="P.sh. John Doe"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="ownerEmail" className={labelClass}>
              Email i pronarit *
            </label>
            <input
              id="ownerEmail"
              name="ownerEmail"
              type="email"
              required
              placeholder="owner@berberi.com"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-zinc-400">
              Pronari hyn me këtë email dhe fjalëkalimin fillestar që caktoni më poshtë.
            </p>
          </div>
          <div>
            <label htmlFor="ownerPassword" className={labelClass}>
              Fjalëkalimi fillestar *
            </label>
            <input
              id="ownerPassword"
              name="ownerPassword"
              type="password"
              required
              minLength={6}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="expiresAt" className={labelClass}>
            Data e skadimit
          </label>
          <input
            key={expiryDefault}
            id="expiresAt"
            name="expiresAt"
            type="date"
            defaultValue={expiryDefault}
            className={inputClass}
          />
        </div>

        <HiddenSwitchValue name="isTrial" checked={isTrial} />
        <HiddenSwitchValue name="isActive" checked={active} />

        <SwitchField
          label="Berber test (provë)"
          hint="Shëno llogaritë e provës ose testimit."
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

        {errorMessage ? <p className={errorBoxClass}>{errorMessage}</p> : null}

        <ModalActions>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className={btnSecondaryClass}
          >
            Anulo
          </button>
          <button type="submit" disabled={pending} className={btnPrimaryClass}>
            {pending ? "Duke krijuar..." : "Krijo berberinë"}
          </button>
        </ModalActions>
      </form>
    </FormModal>
  );
}
