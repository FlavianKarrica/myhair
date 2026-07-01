"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { createTenant } from "@/app/actions/admin/tenants";
import type { TenantActionError, TenantActionState } from "@/lib/validations/tenant";

const initialState: TenantActionState = { success: false };

export function CreateTenantForm() {
  const t = useTranslations("admin.tenants");
  const [state, formAction, pending] = useActionState(createTenant, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  const errorMessage = state.error
    ? t(`errors.${state.error as TenantActionError}`)
    : null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold">{t("createTitle")}</h2>
      <p className="mt-1 text-sm text-zinc-600">{t("createDesc")}</p>

      <form ref={formRef} action={formAction} className="mt-6 space-y-5">
        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-zinc-900">
            {t("shopSection")}
          </legend>

          <Field label={t("shopName")} name="shopName" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("slug")}
              name="slug"
              placeholder={t("slugPlaceholder")}
            />
            <Field
              label={t("subdomain")}
              name="subdomain"
              placeholder={t("subdomainPlaceholder")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("phone")} name="phone" type="tel" />
            <Field label={t("shopEmail")} name="email" type="email" />
          </div>
          <Field label={t("address")} name="address" />
        </fieldset>

        <fieldset className="space-y-4 border-t border-zinc-100 pt-5">
          <legend className="text-sm font-medium text-zinc-900">
            {t("ownerSection")}
          </legend>

          <Field label={t("ownerName")} name="ownerName" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("ownerEmail")}
              name="ownerEmail"
              type="email"
              required
            />
            <Field
              label={t("ownerPassword")}
              name="ownerPassword"
              type="password"
              required
              minLength={6}
            />
          </div>
        </fieldset>

        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {state.success && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {t("success")}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60"
        >
          {pending ? t("creating") : t("createButton")}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
      />
    </div>
  );
}
