"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { createStaff } from "@/app/actions/dashboard/staff";
import type { DashboardActionError, DashboardActionState } from "@/lib/validations/dashboard";

const initialState: DashboardActionState = { success: false };

export function CreateStaffForm() {
  const t = useTranslations("dashboard.staff");
  const [state, formAction, pending] = useActionState(createStaff, initialState);
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
        <Field label={t("name")} name="name" required />
        <Field label={t("email")} name="email" type="email" required />
        <Field
          label={t("phone")}
          name="phone"
          type="tel"
          required
          placeholder="+355 6x xxx xxxx"
        />
        <Field
          label={t("password")}
          name="password"
          type="password"
          required
          minLength={6}
        />

        {errorMessage && <ErrorBox message={errorMessage} />}
        {state.success && <SuccessBox message={t("success")} />}

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
  minLength,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
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
        minLength={minLength}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
      />
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>
  );
}

function SuccessBox({ message }: { message: string }) {
  return (
    <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
      {message}
    </p>
  );
}
