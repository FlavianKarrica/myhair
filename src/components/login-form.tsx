"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { getRoleHomePath } from "@/lib/auth-utils";
import type { UserRole } from "@/generated/prisma/client";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t("invalidCredentials"));
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role as UserRole | undefined;

    if (role) {
      router.push(getRoleHomePath(role));
      router.refresh();
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          {t("password")}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-11 w-full items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60"
      >
        {loading ? t("signingIn") : t("signIn")}
      </button>
    </form>
  );
}
