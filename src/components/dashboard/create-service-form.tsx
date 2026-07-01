"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { createService } from "@/app/actions/dashboard/services";
import type { DashboardActionError, DashboardActionState } from "@/lib/validations/dashboard";

const initialState: DashboardActionState = { success: false };

export function CreateServiceForm() {
  const t = useTranslations("dashboard.services");
  const [state, formAction, pending] = useActionState(createService, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  const errorMessage = state.error
    ? t(`errors.${state.error as DashboardActionError}`)
    : null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold">{t("createTitle")}</h2>
      <p className="mt-1 text-sm text-zinc-600">{t("createDesc")}</p>

      <form ref={formRef} action={formAction} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("nameSq")} name="nameSq" required />
          <Field label={t("nameEn")} name="nameEn" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t("duration")}
            name="durationMinutes"
            type="number"
            required
            min={5}
            max={480}
            defaultValue={30}
          />
          <Field
            label={t("price")}
            name="price"
            type="number"
            required
            min={0}
            step="0.01"
          />
        </div>
        <Field label={t("descriptionSq")} name="descriptionSq" />
        <Field label={t("descriptionEn")} name="descriptionEn" />

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
          className="flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
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
  min,
  max,
  step,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: string | number;
  defaultValue?: string | number;
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
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
      />
    </div>
  );
}
